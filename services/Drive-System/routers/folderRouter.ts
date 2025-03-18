import express from "express";

import {
  createFolderAPI,
  getFolderAPI,
  shareFolderAPI,
} from "../controller/folderController";
import verifyToken from "../../../src/middleware/auth";

const folderRouter = express.Router();

folderRouter.post("/createfolder", verifyToken, createFolderAPI);
folderRouter.get("/get/:folderId", verifyToken, getFolderAPI);
folderRouter.post("/share", verifyToken, shareFolderAPI);

export default folderRouter;
