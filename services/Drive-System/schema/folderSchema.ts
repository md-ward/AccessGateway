import { Document, model, Schema, Types } from "mongoose";

export interface Folder extends Document {
  name: string;
  owner: Types.ObjectId;
  parent: Types.ObjectId | null;
  access: "private" | "shared" | "public";
  sharedWith: Types.ObjectId[];
}

const folderSchema = new Schema<Folder>(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      required: false,
    },
    access: {
      type: String,
      enum: ["private", "shared", "public"],
      default: "private",
    },
    sharedWith: [
      {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

export const Folder = model<Folder>("Folder", folderSchema);
