import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const code = ts.transpileModule(fs.readFileSync('src/services/composables/Sv_MonitorConnectionBack.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function setup() {
  const auth = { isAuthenticated: true, portalSession: 'original', sessionExpired: false };
  let poll, respond = async () => ({status: 200});
  const requests = [], exports = {};
  vm.runInNewContext(code, { exports, AbortController, document: {hidden:false},
    setTimeout:()=>1, clearTimeout:()=>{}, setInterval:fn=>{poll=fn;return 1;},clearInterval:()=>{},
    fetch:async (url, config)=>{requests.push({url,config});return respond();},
    require:name=> name==='vue' ? {ref:value=>({value}), computed:fn=>({get value(){return fn();}}),onMounted:fn=>fn(),onUnmounted:()=>{}} :
      name==='vue-router' ? {useRoute:()=>({meta:{},path:'/tpv'})} : name.includes('authStore') ? {useAuthStore:()=>auth} : {backendUrl:x=>x}
  });
  exports.useConnectionMonitor();
  return {auth,exports,requests,poll:()=>poll(),respond:fn=>{respond=fn;}};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('Network loss preserves login and reconnect signals one refresh',async()=>{
 const h=setup();await settle();h.respond(async()=>{throw new TypeError('offline');});await h.poll();
 assert.equal(h.exports.isOnline.value,false);assert.equal(h.auth.sessionExpired,false);
 h.respond(async()=>({status:200}));await h.poll();assert.equal(h.exports.onReconnected.value,1);
 assert.equal(h.requests.at(-1).config.headers['X-Portal-Session'],'original');
 assert.ok(h.requests.every(r=>r.config.method==='GET'));
});
test('Restart rejecting the session marks expiration without logging out or replaying requests',async()=>{
 const h=setup();await settle();h.exports.isOnline.value=false;h.respond(async()=>({status:401}));await h.poll();
 assert.equal(h.auth.sessionExpired,true);assert.equal(h.auth.isAuthenticated,true);
 assert.equal(h.exports.isOnline.value,true);assert.equal(h.exports.onReconnected.value,0);
});
test('Late 401 cannot expire a new login',async()=>{
 const h=setup();await settle();h.respond(async()=>{h.auth.portalSession='new';return {status:401};});await h.poll();
 assert.equal(h.auth.sessionExpired,false);
});
test('Anonymous 401 does not expire a login; gateway error stays offline',async()=>{
 const h=setup();await settle();h.auth.isAuthenticated=false;h.respond(async()=>({status:401}));await h.poll();
 assert.equal(h.auth.sessionExpired,false);assert.deepEqual(Object.keys(h.requests.at(-1).config.headers),[]);
 h.respond(async()=>({status:503}));await h.poll();assert.equal(h.exports.isOnline.value,false);
});
test('Slow ping is not duplicated by interval',async()=>{
 const h=setup();await settle();let finish;h.respond(()=>new Promise(resolve=>{finish=resolve;}));
 const pending=h.poll();const count=h.requests.length;await h.poll();assert.equal(h.requests.length,count);
 finish({status:200});await pending;
});
