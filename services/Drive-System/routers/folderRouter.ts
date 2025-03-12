import express from "express";

import {
  createFolderAPI,
  getFolderAPI,
  shareFolderAPI,
} from "../controller/folderController";
import verifyToken from "../middlewares/auth";

const router = express.Router();

router.post("/createfolder", verifyToken, createFolderAPI);
router.get("/get/:folderId", verifyToken, getFolderAPI);
router.post("/sharefolder", verifyToken, shareFolderAPI);

export default router;
