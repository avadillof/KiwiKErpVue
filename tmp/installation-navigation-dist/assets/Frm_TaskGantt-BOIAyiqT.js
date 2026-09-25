import{Bn as e,En as t,Hn as n,Ht as r,Jn as i,Kn as a,Mn as o,Qn as s,Rn as c,Un as l,Wt as u,Xn as d,Zn as f,_r as p,er as m,fr as h,hr as g,in as _,ir as v,lr as y,mr as b,nr as x,qn as S,rn as C,sn as w,tn as ee,tr as T,vr as E,zn as D}from"./index-DbkIeeZd.js";var O=w.extend({name:`togglebutton`,style:`
    .p-togglebutton {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        overflow: hidden;
        position: relative;
        color: dt('togglebutton.color');
        background: dt('togglebutton.background');
        border: 1px solid dt('togglebutton.border.color');
        padding: dt('togglebutton.padding');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
        border-radius: dt('togglebutton.border.radius');
        outline-color: transparent;
        font-weight: dt('togglebutton.font.weight');
    }

    .p-togglebutton-content {
        display: inline-flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        gap: dt('togglebutton.gap');
        padding: dt('togglebutton.content.padding');
        background: transparent;
        border-radius: dt('togglebutton.content.border.radius');
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover {
        background: dt('togglebutton.hover.background');
        color: dt('togglebutton.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked {
        background: dt('togglebutton.checked.background');
        border-color: dt('togglebutton.checked.border.color');
        color: dt('togglebutton.checked.color');
    }

    .p-togglebutton-checked .p-togglebutton-content {
        background: dt('togglebutton.content.checked.background');
        box-shadow: dt('togglebutton.content.checked.shadow');
    }

    .p-togglebutton:focus-visible {
        box-shadow: dt('togglebutton.focus.ring.shadow');
        outline: dt('togglebutton.focus.ring.width') dt('togglebutton.focus.ring.style') dt('togglebutton.focus.ring.color');
        outline-offset: dt('togglebutton.focus.ring.offset');
    }

    .p-togglebutton.p-invalid {
        border-color: dt('togglebutton.invalid.border.color');
    }

    .p-togglebutton:disabled {
        opacity: 1;
        cursor: default;
        background: dt('togglebutton.disabled.background');
        border-color: dt('togglebutton.disabled.border.color');
        color: dt('togglebutton.disabled.color');
    }

    .p-togglebutton-label,
    .p-togglebutton-icon {
        position: relative;
        transition: none;
    }

    .p-togglebutton-icon {
        color: dt('togglebutton.icon.color');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover .p-togglebutton-icon {
        color: dt('togglebutton.icon.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked .p-togglebutton-icon {
        color: dt('togglebutton.icon.checked.color');
    }

    .p-togglebutton:disabled .p-togglebutton-icon {
        color: dt('togglebutton.icon.disabled.color');
    }

    .p-togglebutton-sm {
        padding: dt('togglebutton.sm.padding');
        font-size: dt('togglebutton.sm.font.size');
    }

    .p-togglebutton-sm .p-togglebutton-content {
        padding: dt('togglebutton.content.sm.padding');
    }

    .p-togglebutton-lg {
        padding: dt('togglebutton.lg.padding');
        font-size: dt('togglebutton.lg.font.size');
    }

    .p-togglebutton-lg .p-togglebutton-content {
        padding: dt('togglebutton.content.lg.padding');
    }

    .p-togglebutton-fluid {
        width: 100%;
    }
`,classes:{root:function(e){var t=e.instance,n=e.props;return[`p-togglebutton p-component`,{"p-togglebutton-checked":t.active,"p-invalid":t.$invalid,"p-togglebutton-fluid":n.fluid,"p-togglebutton-sm p-inputfield-sm":n.size===`small`,"p-togglebutton-lg p-inputfield-lg":n.size===`large`}]},content:`p-togglebutton-content`,icon:`p-togglebutton-icon`,label:`p-togglebutton-label`}}),k={name:`BaseToggleButton`,extends:r,props:{onIcon:String,offIcon:String,onLabel:{type:String,default:`Yes`},offLabel:{type:String,default:`No`},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null},size:{type:String,default:null},fluid:{type:Boolean,default:null}},style:O,provide:function(){return{$pcToggleButton:this,$parentInstance:this}}};function A(e){"@babel/helpers - typeof";return A=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},A(e)}function j(e,t,n){return(t=M(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function M(e){var t=N(e,`string`);return A(t)==`symbol`?t:t+``}function N(e,t){if(A(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(A(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}var P={name:`ToggleButton`,extends:k,inheritAttrs:!1,emits:[`change`],methods:{getPTOptions:function(e){return(e===`root`?this.ptmi:this.ptm)(e,{context:{active:this.active,disabled:this.disabled}})},onChange:function(e){!this.disabled&&!this.readonly&&(this.writeValue(!this.d_value,e),this.$emit(`change`,e))},onBlur:function(e){var t,n;(t=(n=this.formField).onBlur)==null||t.call(n,e)}},computed:{active:function(){return this.d_value===!0},hasLabel:function(){return o(this.onLabel)&&o(this.offLabel)},label:function(){return this.hasLabel?this.d_value?this.onLabel:this.offLabel:`\xA0`},dataP:function(){return t(j({checked:this.active,invalid:this.$invalid},this.size,this.size))}},directives:{ripple:_}},F=[`tabindex`,`disabled`,`aria-pressed`,`aria-label`,`aria-labelledby`,`data-p-checked`,`data-p-disabled`,`data-p`],I=[`data-p`];function L(t,r,i,a,o,s){var c=v(`ripple`);return y((m(),l(`button`,d({type:`button`,class:t.cx(`root`),tabindex:t.tabindex,disabled:t.disabled,"aria-pressed":t.d_value,onClick:r[0]||=function(){return s.onChange&&s.onChange.apply(s,arguments)},onBlur:r[1]||=function(){return s.onBlur&&s.onBlur.apply(s,arguments)}},s.getPTOptions(`root`),{"aria-label":t.ariaLabel,"aria-labelledby":t.ariaLabelledby,"data-p-checked":s.active,"data-p-disabled":t.disabled,"data-p":s.dataP}),[e(`span`,d({class:t.cx(`content`)},s.getPTOptions(`content`),{"data-p":s.dataP}),[x(t.$slots,`default`,{},function(){return[x(t.$slots,`icon`,{value:t.d_value,class:g(t.cx(`icon`))},function(){return[t.onIcon||t.offIcon?(m(),l(`span`,d({key:0,class:[t.cx(`icon`),t.d_value?t.onIcon:t.offIcon]},s.getPTOptions(`icon`)),null,16)):n(``,!0)]}),e(`span`,d({class:t.cx(`label`)},s.getPTOptions(`label`)),E(s.label),17)]})],16,I)],16,F)),[[c]])}P.render=L;var te={class:`gantt`},ne={class:`gantt-legend`},re={class:`archive-toggle`},ie={class:`gantt-zoom`},ae={class:`gantt-zoom-label`},oe={class:`gantt-header`},se={class:`gantt-timeline`},ce={class:`gantt-days`},le=[`onClick`],ue=[`title`],de={class:`gantt-label-main`},fe={class:`gantt-label-who`},pe={class:`gantt-timeline gantt-track`},R=[`title`],z={key:0,class:`gantt-pct`},me={class:`gantt-after`},he={class:`gantt-who`},ge=[`src`,`alt`,`onError`],_e={key:1,class:`gantt-who-initials`},ve={class:`gantt-who-name`},ye={key:0,class:`gantt-after-pct`},be={key:1,class:`gantt-flag`},xe={key:1,class:`kanban-empty`},Se={key:2,class:`gantt-unscheduled`},Ce=[`onClick`],B=C(i({__name:`Frm_TaskGantt`,props:{tasks:{}},emits:[`edit`],setup(t,{emit:r}){let i=r,o=t,d=h(!1),_=h({});function v(e){return e.userName||e.contactName||`—`}function y(e){return(e||`?`).trim().split(/\s+/).filter(Boolean).slice(0,2).map(e=>e.charAt(0).toUpperCase()).join(``)}let x=e=>ee(`/gestdoc/users/${e}/photoPerfil.jpg`),C=e=>{_.value[e]=!0};function w(e){return e.state===`PLANIFICADA`||e.state===`EN_CURSO`}let O=[12,18,26,38,54],k=[`Día`,`Semana`,`Mes`,`Detalle`,`Max`],A=h(2),j=D(()=>O[A.value]),M=D(()=>k[A.value]),N=h(null);function F(){A.value<O.length-1&&(A.value++,f(()=>L(!1)))}function I(){A.value>0&&(A.value--,f(()=>L(!1)))}function L(e=!0){let t=N.value;!t||!J.value||t.scrollTo({left:Math.max(0,Y.value-t.clientWidth/3),behavior:e?`smooth`:`auto`})}s(()=>f(()=>L(!1)));let B=[{label:`Planificado`,color:`#7fb3d5`},{label:`Realizándose`,color:`#f0b429`},{label:`Hecho`,color:`#7fb069`},{label:`Descartado`,color:`#c9ccd1`},{label:`Vencida`,color:`#e05252`}];function V(e){if(!e)return null;if(e instanceof Date)return e;let t=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(e));if(t)return new Date(Number(t[1]),Number(t[2])-1,Number(t[3]));let n=new Date(e);return isNaN(n.getTime())?null:new Date(n.getFullYear(),n.getMonth(),n.getDate())}function we(e){return`${e.getFullYear()}-${e.getMonth()}-${e.getDate()}`}function H(e){return V(e.startDate)??V(e.dateUp)}let U=D(()=>o.tasks.filter(e=>(d.value||w(e))&&(V(e.dueDate)||H(e)))),W=D(()=>o.tasks.filter(e=>(d.value||w(e))&&!V(e.dueDate)&&!H(e))),G=D(()=>{let e=new Date;e.setHours(0,0,0,0);let t=e,n=new Date(e.getTime()+30*864e5);for(let e of U.value){let r=H(e)??V(e.dueDate),i=V(e.dueDate)??H(e);r&&r<t&&(t=r),i&&i>n&&(n=i)}return t=new Date(t.getTime()-3*864e5),n=new Date(n.getTime()+7*864e5),Math.round((n.getTime()-t.getTime())/864e5)>150&&(n=new Date(t.getTime()+150*864e5)),{min:t,max:n}}),K=D(()=>{let e=[],t=new Date;t.setHours(0,0,0,0);let n=new Date(G.value.min);for(;n<=G.value.max;){let r=n.getDay();e.push({key:we(n)+`_`+e.length,num:n.getDate(),weekend:r===0||r===6,today:n.getTime()===t.getTime()}),n.setDate(n.getDate()+1)}return e}),Te=D(()=>{let e=[`ene`,`feb`,`mar`,`abr`,`may`,`jun`,`jul`,`ago`,`sep`,`oct`,`nov`,`dic`],t=[],n=new Date(G.value.min);for(;n<=G.value.max;){let r=`${n.getFullYear()}-${n.getMonth()}`,i=t[t.length-1];i&&i.key===r?i.days++:t.push({key:r,label:`${e[n.getMonth()]} ${n.getFullYear()}`,days:1}),n.setDate(n.getDate()+1)}return t}),q=D(()=>{let e=U.value.map(e=>{let t=H(e)??V(e.dueDate)??new Date,n=V(e.dueDate)??new Date(t.getTime()+864e5);return n<t&&(n=t),{task:e,start:t,end:n}});return e.sort((e,t)=>e.end.getTime()-t.end.getTime()),e}),Ee=D(()=>280+K.value.length*j.value),J=D(()=>{let e=new Date;return e.setHours(0,0,0,0),e>=G.value.min&&e<=G.value.max}),Y=D(()=>{let e=new Date;return e.setHours(0,0,0,0),Math.round((e.getTime()-G.value.min.getTime())/864e5)*j.value});function X(e){if(e.overdue)return`#e05252`;switch(e.state){case`EN_CURSO`:return`#f0b429`;case`FINALIZADA`:return`#7fb069`;case`DESCARTADA`:return`#c9ccd1`;default:return`#7fb3d5`}}function Z(e){let t=j.value;return Math.max(t,(Math.round((e.end.getTime()-e.start.getTime())/864e5)+1)*t)}function Q(e){return Z(e)>=52}function De(e){let t=j.value;return{left:Math.max(0,Math.round((e.start.getTime()-G.value.min.getTime())/864e5))*t+`px`,width:Z(e)+`px`,background:X(e.task)}}function Oe(e){return`${e.code} · ${e.name} (${$(e)} %)`}function $(e){return e.state===`FINALIZADA`?100:Math.min(100,Math.max(0,Math.round(Number(e.progress??0))))}return(t,r)=>(m(),l(`div`,te,[e(`div`,ne,[(m(),l(c,null,T(B,t=>e(`span`,{key:t.label,class:`gantt-legend-item`},[e(`i`,{style:p({background:t.color})},null,4),a(E(t.label),1)])),64)),r[2]||=e(`span`,{class:`gantt-legend-item`},[e(`i`,{class:`today-mark`}),a(`Hoy`)],-1),e(`span`,re,[S(b(P),{modelValue:d.value,"onUpdate:modelValue":r[0]||=e=>d.value=e,onLabel:`Hechas`,offLabel:`Hechas`,onIcon:`pi pi-check`,offIcon:`pi pi-check`,size:`small`,title:`Mostrar también finalizadas y descartadas`},null,8,[`modelValue`])]),e(`span`,ie,[S(b(u),{icon:`pi pi-minus`,rounded:``,text:``,size:`small`,title:`Reducir zoom`,disabled:A.value<=0,onClick:I},null,8,[`disabled`]),e(`span`,ae,E(M.value),1),S(b(u),{icon:`pi pi-plus`,rounded:``,text:``,size:`small`,title:`Ampliar zoom`,disabled:A.value>=O.length-1,onClick:F},null,8,[`disabled`]),S(b(u),{label:`Hoy`,size:`small`,text:``,onClick:r[1]||=e=>L()})])]),q.value.length?(m(),l(`div`,{key:0,ref_key:`scrollBox`,ref:N,class:`gantt-scroll`},[e(`div`,{class:`gantt-grid`,style:p({width:Ee.value+`px`})},[e(`div`,oe,[r[3]||=e(`div`,{class:`gantt-label head`},`Tarea`,-1),e(`div`,se,[(m(!0),l(c,null,T(Te.value,e=>(m(),l(`div`,{key:e.key,class:`gantt-month`,style:p({width:e.days*j.value+`px`})},E(e.label),5))),128)),e(`div`,ce,[(m(!0),l(c,null,T(K.value,e=>(m(),l(`span`,{key:e.key,class:g([`gantt-day`,{weekend:e.weekend,today:e.today}]),style:p({width:j.value+`px`})},E(e.num),7))),128))])])]),(m(!0),l(c,null,T(q.value,t=>(m(),l(`div`,{key:t.task.pkid??t.task.code,class:`gantt-row`,onClick:e=>i(`edit`,t.task)},[e(`div`,{class:`gantt-label`,title:t.task.name},[e(`div`,de,[e(`strong`,null,E(t.task.code),1),e(`span`,null,E(t.task.name),1)]),e(`small`,fe,E(v(t.task)),1)],8,ue),e(`div`,pe,[(m(!0),l(c,null,T(K.value,e=>(m(),l(`span`,{key:e.key,class:g([`gantt-cell`,{weekend:e.weekend}]),style:p({width:j.value+`px`})},null,6))),128)),e(`div`,{class:`gantt-bar`,style:p(De(t)),title:Oe(t.task)},[e(`div`,{class:`gantt-fill`,style:p({width:$(t.task)+`%`})},null,4),Q(t)?(m(),l(`span`,z,E($(t.task))+` %`,1)):n(``,!0),e(`span`,me,[e(`span`,he,[t.task.userPkid&&!_.value[t.task.userPkid]?(m(),l(`img`,{key:0,src:x(t.task.userPkid),alt:v(t.task),onError:e=>C(t.task.userPkid)},null,40,ge)):(m(),l(`span`,_e,E(y(v(t.task))),1))]),e(`span`,ve,E(v(t.task)),1),Q(t)?n(``,!0):(m(),l(`span`,ye,E($(t.task))+` %`,1))]),t.task.overdue?(m(),l(`span`,be,`Vencida`)):n(``,!0)],12,R),J.value?(m(),l(`div`,{key:0,class:`gantt-today`,style:p({left:Y.value+`px`})},null,4)):n(``,!0)])],8,le))),128))],4)],512)):(m(),l(`div`,xe,`Sin tareas con fecha para mostrar.`)),W.value.length?(m(),l(`div`,Se,[r[5]||=e(`h4`,null,`Sin planificar (sin vencimiento ni alta)`,-1),(m(!0),l(c,null,T(W.value,t=>(m(),l(`button`,{key:t.pkid??t.code,type:`button`,class:`recent-chip`,onClick:e=>i(`edit`,t)},[r[4]||=e(`span`,{class:`recent-icon`,style:{color:`#648506`,background:`#eef4d8`}},[e(`i`,{class:`pi pi-clipboard`})],-1),e(`span`,null,E(t.code)+` · `+E(t.name),1)],8,Ce))),128))])):n(``,!0)]))}}),[[`__scopeId`,`data-v-3f93a4a7`]]);export{P as n,B as t};