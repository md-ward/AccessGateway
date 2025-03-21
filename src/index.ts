import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import ROUTES from "./middleware/routes";
import setupProxies from "./middleware/proxy";
import companyRouter from "./routes/companyRouter";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ Create the HTTP server separately

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/comp", companyRouter);
// ✅ Pass the server instance to `setupProxies`
setupProxies(app, server, ROUTES);

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
