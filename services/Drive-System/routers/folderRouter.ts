import express from "express";

import {
  createFolderAPI,
  getFolderAPI,
  shareFolderAPI,
} from "../controller/folderController";

const folderRouter = express.Router();

folderRouter.post("/createfolder", createFolderAPI);
folderRouter.get("/get/:folderId", getFolderAPI);
folderRouter.post("/share", shareFolderAPI);

export default folderRouter;
