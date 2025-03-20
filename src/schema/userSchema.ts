import { Document, model, Schema } from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Service } from "./companySchema";
dotenv.config();
export enum Role {
  OWNER = "owner",
  ADMIN = "admin",
  USER = "user",
}
export interface User extends Document {
  name: string;
  email: string;
  password: string;
  team?: string;
  role?: Role;
  services?: Service[] ;

  comp: Schema.Types.ObjectId[];
}

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      // unique: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
    services: {
      type: [String],
      enum: Object.values(Service),
      required: false,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
      validate: {
        validator: function (value: string) {
          return /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    team: {
      type: String,
      required: false,
    },
    comp: {
      type: [Schema.Types.ObjectId],
      ref: "company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});
export const User = model<User>("User", userSchema);
