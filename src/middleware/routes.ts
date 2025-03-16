import { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const ROUTES = [
  {
    url: "/chat",
    proxy: {
      target: "http://localhost:3000",
      changeOrigin: true,
      pathRewrite: {
        [`^/chat`]: "",
      },
      ws: true, // Enable WebSocket support
      on: {
        proxyReq: (proxyReq: any, req: Request, res: Response) => {
          if (req.headers["authorization"]) {
            proxyReq.setHeader("Authorization", req.headers["authorization"]);
          }
          if (req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.write(bodyData);
          }
        },
      },
    },
  },
  {
    url: "/drive",
    proxy: {
      target: "http://localhost:8003",
      changeOrigin: true,
      pathRewrite: {
        [`^/drive`]: "",
      },
      on: {
        proxyReq: (proxyReq: any, req: Request, res: Response) => {
          if (req.headers["authorization"]) {
            proxyReq.setHeader("Authorization", req.headers["authorization"]);
          }
          if (req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.write(bodyData);
          }
        },
      },
    },
  },
];

export default ROUTES;
