import { Document, Model, model, Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
export interface User extends Document {
  name: string;
  email: string;
  password: string;
  token?: string;
  team: string;
  comp: Types.ObjectId;
}
interface UserMethods {
  generateToken(): string;
  loginUser(): User;
}
type UserModel = Model<User, object, UserMethods>;

const userSchema = new Schema<User, UserMethods, UserModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
      required: true,
    },
    comp: {
      type: Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    token: String,
  },
  {
    timestamps: true,
  }
);
userSchema.methods.generateToken = async function (): Promise<string> {
  const token = jwt.sign(
    { _id: this._id.toString() },
    process.env.PASSWORD as string
  );
  this.token = token;
  await this.save();
  return token;
};

userSchema.statics.LoginUser = async function (
  email: string,
  password: string
): Promise<User> {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email not found");
  }
  const isMatch = await bcrypt.compare(password, user.password as string);
  if (!isMatch) {
    throw new Error("Incorrect password");
  }
  return user;
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});
export const User = model<User, UserModel>("User", userSchema);
