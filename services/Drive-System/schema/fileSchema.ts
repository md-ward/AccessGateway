import { Document, model, Schema, Types } from "mongoose";

export interface File extends Document {
  name: string;
  size: Number;
  type: string;
  path: Types.ObjectId | null;
  owner: Types.ObjectId;
  access: "private" | "shared" | "public";
  sharedWith: Types.ObjectId[];
  cloudinaryUrl: string;
}

const fileSchema = new Schema<File>(
  {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    path: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      required: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    cloudinaryUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const File = model<File>("File", fileSchema);
