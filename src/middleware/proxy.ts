import { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Server } from "http";
import { Socket } from "net";

const setupProxies = (
  app: Express,
  server: Server,
  routes: { url: string; proxy: any }[]
) => {
  routes.forEach((r) => {
    const proxyMiddleware = createProxyMiddleware(r.proxy);
    app.use(r.url, proxyMiddleware);

    // ✅ Handle WebSocket upgrades
    if (r.proxy.ws) {
      server.on("upgrade", (req, socket: any, head) => {
        console.log(`WebSocket upgrade request for ${req.url}`);

        // ✅ Explicitly cast `socket` as `Socket`
        proxyMiddleware.upgrade?.(req, socket as Socket, head);
      });
    }
  });
};

export default setupProxies;
