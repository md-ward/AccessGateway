import { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Server, IncomingMessage } from "http";
import { Socket } from "net";
import { verifyTokenWs } from "./authCheck";

const setupProxies = (
  app: Express,
  server: Server,
  routes: {
    url: string;
    proxy: { target: string; changeOrigin?: boolean; ws?: boolean };
  }[]
) => {
  routes.forEach((r) => {
    const proxyMiddleware = createProxyMiddleware(r.proxy);

    // ✅ Apply token verification middleware for normal HTTP requests
    app.use(r.url, proxyMiddleware);

    // ✅ Handle WebSocket upgrade requests
    if (r.url === "/chat" && r.proxy.ws) {
      console.log(`Setting up WebSocket proxy for ${r.url}`);

      server.on(
        "upgrade",
        async (req: IncomingMessage, socket: Socket, head) => {
          console.log(`WebSocket upgrade request for ${req.url}`);

          // ✅ Extract token from headers (WebSockets have no body)
          const token = req.headers["authorization"];

          if (!token) {
            console.error("No token provided, closing WebSocket");
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
          }

          try {
            // ✅ Verify token using a separate function for WebSockets
            const decoded = await verifyTokenWs(token);

            if (!decoded) {
              console.error("Invalid token, closing WebSocket");
              socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
              socket.destroy();
              return;
            }

            if (!decoded || !decoded.id) {
              console.error("Invalid token, closing WebSocket");
              socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
              socket.destroy();
              return;
            }

            console.log("WebSocket authenticated for user:", decoded);
 
            // ✅ Attach user ID to headers before proxying
            req.headers["x-user-id"] = decoded.id;
            req.headers["x-company-id"] = decoded.company[0];

            // ✅ Forward WebSocket request to backend
            proxyMiddleware.upgrade(req, socket, head);
          } catch (error) {
            console.error("Error verifying token:", error);
            socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
            socket.destroy();
          }
        }
      );
    }
  });
};

export default setupProxies;
