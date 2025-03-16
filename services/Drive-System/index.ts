import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import connectToMongoDB from "./DataBase/DB";
import Userouter from "./routers/userRouter";
import Folderrouter from "./routers/folderRouter";
import Filerouter from "./routers/fileRouter";
import { log } from "./controller/userController";
// import { ExpressPeerServer } from "peer";

// Load environment variables
dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/user", Userouter);
app.use("/", log);
app.use("/folder", Folderrouter);
app.use("/file", Filerouter);

const port = process.env.Drive_Port;
const server = http.createServer(app);
connectToMongoDB();
server.listen(port, () => {
  console.log("server running at http://localhost:", port);
});
