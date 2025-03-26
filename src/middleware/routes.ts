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
      pathRewrite: {
        [`^/chat`]: "",
      },
      on: {},
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
