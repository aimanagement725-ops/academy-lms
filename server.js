// Custom server so Next.js (HTTP) and the AI voice-partner relay (WebSocket)
// share one process/port -- this is what lets the app deploy as a single
// service on Railway/Render instead of splitting across two hosts.

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");
const { attachRealtimeRelay } = require("./server/realtime-relay");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

console.log(`> Initializing Next.js app in ${dev ? "development" : "production"} mode...`);

const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const httpServer = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    // Dedicated WS server mounted at /api/ai/realtime, separate from Next's
    // own internal upgrade handling (e.g. HMR in dev).
    const wss = new WebSocketServer({ noServer: true });
    attachRealtimeRelay(wss);

    httpServer.on("upgrade", (req, socket, head) => {
      const { pathname } = parse(req.url);
      if (pathname === "/api/ai/realtime") {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit("connection", ws, req);
        });
      } else {
        // Let Next.js handle anything else (e.g. dev HMR socket)
        socket.destroy();
      }
    });

    httpServer.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Fatal Error during app.prepare():", err);
    process.exit(1);
  });