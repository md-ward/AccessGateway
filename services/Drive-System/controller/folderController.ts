//libraries imports
import { Response, Request } from "express";
import { Types } from "mongoose";
//schema import
import { User } from "../schema/userSchema";
import { File } from "../schema/fileSchema";
import { Folder } from "../schema/folderSchema";
//tools import
import { AuthRequest } from "../middlewares/auth";

//create Folder API
export const createFolderAPI = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthRequest;
  try {
    const folder = new Folder({
      name: req.body.name,
      owner: authReq.user._id,
      parent: req.body.parent || null,
      access: req.body.access || "private",
    });
    await folder.save();
    res.status(201).send(folder);
  } catch (error) {
    res.status(400).send(error);
  }
};

//get Folder Content API
export const getFolderAPI = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthRequest;
  try {
    const { folderId } = authReq.params; // Use params instead of body
    console.log(folderId);
    const user = authReq.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate `folderId`
    if (!Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }

    // Find the folder
    const folder = await Folder.findOne({
      _id: folderId,
      $or: [
        { owner: user._id }, // Owner has access
        { access: "public" }, // Public access
        { access: "shared", sharedWith: user._id }, // Shared access (assuming sharedWith is the field storing shared users)
      ],
    });
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    const folders = await Folder.find({ path: folderId });
    const files = await File.find({ path: folderId });
    res.status(200).json({ files, folders });
  } catch (error) {
    res.status(400).json({ error });
  }
};

//share Folder API
export const shareFolderAPI = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authReq = req as AuthRequest;
  try {
    const { folderId, userIds } = authReq.body;
    const user = authReq.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!userIds || userIds.length === 0) {
      return res
        .status(400)
        .json({ error: "No users provided to share the folder with" });
    }

    if (!Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }

    const folder = await Folder.findOne({
      _id: folderId,
      owner: user._id,
    });
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    const validUserIds = userIds.filter((id: string) =>
      Types.ObjectId.isValid(id)
    );
    const existingUsers = await User.find({ _id: { $in: validUserIds } });

    if (existingUsers.length !== validUserIds.length) {
      return res
        .status(400)
        .json({ error: "Some user IDs are invalid or do not exist" });
    }

    if (folder.access === "private") {
      folder.access = "shared";
    }

    folder.sharedWith = Array.from(
      new Set([...(folder.sharedWith || []), ...validUserIds])
    );

    await folder.save();

    res.status(200).json({ message: "Folder shared successfully", folder });
  } catch (error) {
    res.status(500).json({ error });
  }
};
