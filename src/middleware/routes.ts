import { Request, Response } from "express";
import { ClientRequest } from "http";
import dotenv from "dotenv";
import { Service } from "../schema/companySchema";

dotenv.config();

function checkServiceAccess(req: Request, res: Response, service: Service) {
  if (
    !req.body.valid?.decoded.services?.includes(service) &&
    !req.body.valid?.decoded.services.includes("all")
  ) {
    res.status(403).send({ error: "Access denied" });
  } else {
    return;
  }
}

const ROUTES = [
  {
    service: Service.STOCK,
    url: "/stock",
    proxy: {
      target: `http://localhost:${process.env.Recourse_Port}`,
      changeOrigin: true,
      pathRewrite: {
        [`^/stock`]: "",
      },
      ws: true,
      on: {
        proxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
          checkServiceAccess(req, res, Service.STOCK);

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
    service: Service.CHATTING,
    url: "/chat",
    proxy: {
      target: `http://localhost:${process.env.Chat_Port}`,
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
      on: {
        proxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
          // checkServiceAccess(req, res, Service.CHATTING);
          if (req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.write(bodyData);
          }
        },
        // proxyReqWs: (
        //   proxyReq: ClientRequest,
        //   req: Request,
        //   socket: any,
        //   head: any
        // ) => {
        //   console.log("Handling WebSocket Connection for /chat");

        //   // Ensure it's a WebSocket upgrade request
        //   if (
        //     !req.headers.upgrade ||
        //     req.headers.upgrade.toLowerCase() !== "websocket"
        //   ) {
        //     console.error("Invalid WebSocket request");
        //     socket.destroy();
        //     return;
        //   }

        //   // Allow only authorized WebSocket connections
        //   if (!req.headers.authorization) {
        //     console.error("Unauthorized WebSocket request");
        //     socket.destroy();
        //     return;
        //   }

        //   // Properly handle WebSocket requests
        //   socket.on("error", (err: any) =>
        //     console.error("WebSocket Error:", err)
        //   );
        // },
      },
    },
  },
  {
    service: Service.DRIVE,
    url: "/drive",
    proxy: {
      target: `http://localhost:${process.env.Drive_Port}`,
      changeOrigin: true,
      pathRewrite: {
        [`^/drive`]: "",
      },
      on: {
        proxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
          checkServiceAccess(req, res, Service.DRIVE);

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
