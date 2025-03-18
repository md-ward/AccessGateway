import http, { IncomingMessage } from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import ROUTES from "./middleware/routes";
import setupProxies from "./middleware/proxy";
import System from "./schema/companySchema";
import { Socket } from "net";
import companyRouter from "./routes/companyRouter";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/comp", companyRouter);
const server = http.createServer(app); // ✅ Create the HTTP server separately
// ✅ Pass the server instance to `setupProxies`
setupProxies(app, server, ROUTES);

server.on("upgrade", async (req: IncomingMessage, socket: Socket) => {
  try {
    const apiKey = req.headers["authorization"];

    if (!apiKey) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      return socket.destroy();
    }

    const system = await System.findOne({ apiKey });

    if (!system) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      return socket.destroy();
    }

    if (system.expiryDate && new Date() > system.expiryDate) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      return socket.destroy();
    }

    req.headers["x-system-id"] = system._id as string;
  } catch (error) {
    console.error("❌ WebSocket Access Error:", error);
    socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
    socket.destroy();
  }
});

const port = process.env.System_PORT || 8000;

mongoose
  .connect(process.env.System_DB_URL as string)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
