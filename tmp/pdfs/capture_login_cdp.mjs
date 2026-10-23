import fs from "node:fs";

const targets = await (await fetch("http://127.0.0.1:9223/json/list")).json();
const page = targets.find((target) => target.type === "page" && target.url.startsWith("http://127.0.0.1:5174"));
if (!page) throw new Error("No se encontró la página de login en Chrome");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let sequence = 0;

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Fetch.requestPaused") {
    const requestId = message.params.requestId;
    const completed = Buffer.from(JSON.stringify({
      status: "COMPLETED",
      activationPending: false,
      configurationRequired: false,
    })).toString("base64");
    socket.send(JSON.stringify({
      id: ++sequence,
      method: "Fetch.fulfillRequest",
      params: {
        requestId,
        responseCode: 200,
        responseHeaders: [{ name: "Content-Type", value: "application/json" }],
        body: completed,
      },
    }));
    return;
  }
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
};

await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});

function send(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await send("Page.enable");
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `
    (() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (...args) => {
        const url = String(args[0] || '');
        if (url.includes('/WebPing')) {
          return Promise.resolve(new Response('OK', { status: 200 }));
        }
        if (url.includes('/api/installation/status')) {
          return Promise.resolve(new Response(JSON.stringify({
            status: 'COMPLETED', activationPending: false, configurationRequired: false
          }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
        return originalFetch(...args);
      };
    })();
  `,
});
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: "http://127.0.0.1:5174/Frm_Login" });
await new Promise((resolve) => setTimeout(resolve, 6200));
const result = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: false,
  fromSurface: true,
});
fs.writeFileSync(
  "C:/Proyectos/KiwiKErpVue/tmp/pdfs/screenshots/login.png",
  Buffer.from(result.data, "base64"),
);
socket.close();
