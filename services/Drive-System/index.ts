import express, { Application } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import connectToMongoDB from "./DataBase/DB";
import folderRouter from "./routers/folderRouter";
import fileRouter from "./routers/fileRouter";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/folder", folderRouter);
app.use("/file", fileRouter);

const port = process.env.Drive_Port;
const server = http.createServer(app);
connectToMongoDB();
server.listen(port, () => {
  console.log("server running at http://localhost:", port);
});
