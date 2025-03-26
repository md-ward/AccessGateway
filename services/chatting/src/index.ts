import express, { Application } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { sendMessage } from "./controllers/chatControllers";
import { Message } from "./schema/messageSchema";

//* Load environment variables
dotenv.config();

try {
  const app: Application = express();
  app.use(express.json());
  app.use(
    cors({
      origin: "*", // Allow WebSockets and HTTP
      methods: "*",
      allowedHeaders: [
        "x-access-token",
        "x-api-key",
        "x-user-id",
        "x-system-id",
      ],
    })
  );

  const port = process.env.Chat_Port || 3000;
  const server = http.createServer(app);

  // ✅ WebSocket Server Configuration
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: [
        "x-access-token",
        "x-api-key",
        "x-user-id",
        "x-system-id",
      ],
    },
    allowEIO3: true,
  });

  const chatNamespace = io.of("/chat");

  // // ✅ Allow WebSocket connections via proxy
  // io.engine.on("headers", (headers) => {
  //   headers["Access-Control-Allow-Origin"] = "*";
  //   headers["Access-Control-Allow-Headers"] =
  //     "x-access-token, x-api-key, x-user-id, x-system-id";
  // });

  // //! MongoDB Connection
  mongoose
    .connect(process.env.Chat_DB_URL as string)
    .then(() => console.log("✅ Chatting Service Connected to MongoDB"))
    .catch((error) => console.error("❌ Error connecting to MongoDB:", error));

  const onlineUsers: { [companyId: string]: { [userId: string]: string } } = {};

  // ✅ Handle New WebSocket Connection
  chatNamespace.on("connection", (socket: Socket) => {
    // console.log(`🔵 User connected: ${socket.id}`);

    const companyId = socket.handshake.headers["x-company-id"] as string;
    const userId = socket.handshake.query.user as string;

    console.log({ headers: socket.handshake.headers });

    // ✅ Store user in onlineUsers map
    if (!onlineUsers[companyId]) {
      onlineUsers[companyId] = {};
    }
    onlineUsers[companyId][userId] = socket.id;

    // console.log(`✅ Stored user: ${JSON.stringify(onlineUsers, null, 2)}`);

    // ✅ Listen for messages
    socket.on("sendMessage", async (data) => {
      const { message, recipientId } = data;

      console.log(
        `📩 Message from ${userId} (System: ${companyId}) to ${recipientId}: ${message}`
      );

      // ✅ Retrieve recipient's socket ID
      const recipientSocketId = onlineUsers[companyId]?.[recipientId];

      if (recipientSocketId) {
        chatNamespace.to(recipientSocketId).emit("receiveMessage", {
          senderId: userId,
          message: message,
        });
        // ✅ Save message to database
        await sendMessage(
          new Message({
            message,
            senderId: userId,
            receiverId: recipientId,
            companyId,
          })
        );
        console.log(`✅ Message forwarded to ${recipientId}`);
      } else {
        console.log(`❌ Recipient ${recipientId} is offline.`);
      }
    });

    // ✅ Handle User Disconnect
    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.id}`);

      if (onlineUsers[companyId] && onlineUsers[companyId][userId]) {
        delete onlineUsers[companyId][userId];

        // Remove system if empty
        if (Object.keys(onlineUsers[companyId]).length === 0) {
          delete onlineUsers[companyId];
        }

        console.log(`🗑️ Removed user ${userId} from online list.`);
      }
    });
  });

  server.listen(port, () => {
    console.log(`🚀 Chatting Service is running on port ${port}`);
  });
} catch (error) {
  console.log("❌ Error starting Chatting Service:", error);
}
