import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import { NextFunction, Request, Response } from "express";

const servicesLinks = {
  chatting: "http://localhost:8002",
  // attachments: "http://localhost:8003",
  drive: "http://localhost:8003",
};

// Define CustomRequest interface
interface CustomRequest extends Request {
  body: {
    service?: keyof typeof servicesLinks;
  };
}

interface CustomRequest extends Request {
  body: {
    service?: keyof typeof servicesLinks;
  };
}

export function proxyMiddleware(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const service = (req.body.service ||
    req.query.service) as keyof typeof servicesLinks;

  if (!service || !servicesLinks[service]) {
    res.status(400).json({ error: "Invalid or missing service parameter" });
  }

  console.log("Proxying request to:", servicesLinks[service]);
  console.log("Method:", req.method, "Path:", req.url);

  const proxy = createProxyMiddleware(
    {
      target: servicesLinks[service],
      changeOrigin: true,
      ws: true,
      pathRewrite: { "^/api": "" },
      on: {
        error: (err, req, res) => {
          console.error("Proxy Error:", err.message);
          if (res instanceof http.ServerResponse && res.headersSent) return;
          if (res instanceof http.ServerResponse) {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Proxy request failed" }));
          }
        },
        proxyReq: (proxyReq, req) => {
          console.log("Forwarding request to:", servicesLinks[service]);

          [
            "x-access-token",
            "x-refresh-token",
            "x-system-id",
            "x-api-key",
            "x-user-id",
            "x-forwarded-for",
            "referer",
          ].forEach((header) => {
            if (req.headers[header]) {
              proxyReq.setHeader(header, req.headers[header]);
            }
          });
        },
      },
    },
  );

  proxy(req, res, next);
}

// export { proxyMiddleware };

// WebSocket Upgrade Handling
// function handleWebSocketUpgrade(
//   req: http.IncomingMessage,
//   socket: net.Socket,
//   head: Buffer
// ) {
//   if (!(req as CustomRequest).body || !(req as CustomRequest).body?.service) {
//     socket.destroy();
//     ;
//   }

//   const service = (req as CustomRequest).body?.service;
//   if (!service) {
//     socket.destroy();
//     ;
//   }
//   const proxy = createProxyMiddleware({
//     target: servicesLinks[service],
//     ws: true,
//   });

//    proxy.upgrade(req, socket, head);
// }

// export { proxyMiddleware, handleWebSocketUpgrade };
