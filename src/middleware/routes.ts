import { Request, Response } from "express";
import { ClientRequest } from "http";
import dotenv from "dotenv";
import { Service } from "../schema/companySchema";
import { Socket } from "socket.io";
import { checkToken } from "./authCheck";

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

function checkServiceAccessWs(ws: ClientRequest, service: Service) {
  const token = ws.getHeaders().authorization;
  console.log({ token });
  if (token) {
    checkToken(token)
      .then((valid) => {
        if (valid && valid.decoded) {
          console.log({ decoded: valid.decoded });
          if (
            !valid?.decoded.services?.includes(service) &&
            !valid?.decoded.services.includes("all")
          ) {
            ws.write("HTTP/1.1 403 Access Denied\r\n\r\n");
            ws.destroy();
          }
        }
      })
      .catch((error) => {
        console.error("Error validating token:", error);
      });
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
        proxyReqWs: (proxyReq: ClientRequest, req: Request) => {
          checkServiceAccessWs(proxyReq, Service.CHATTING);
        },
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
