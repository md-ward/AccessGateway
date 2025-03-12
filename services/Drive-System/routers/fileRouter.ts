import express from "express";


import verifyToken from "../middlewares/auth";
import upload from "../middlewares/multer";
import { getFileByIdAPI, uploadFileAPI } from "../controller/fileController";

const router = express.Router();

router.post("/storefile", verifyToken, upload, uploadFileAPI);
// router.get("/folder/:folderId", verifyToken, getFilesByFolderId);
router.get("/:fileId", verifyToken, getFileByIdAPI);
export default router;
