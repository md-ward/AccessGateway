import { Document, Model, model, Schema } from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Service } from "./companySchema";
dotenv.config();
enum Role {
  ADMIN = "admin",
  USER = "user",
}
export interface User extends Document {
  name: string;
  email: string;
  password: string;
  team?: string;
  role?: Role;
  services?: Service[] | "All";

  comp: Schema.Types.ObjectId[];
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
      type: [Schema.Types.ObjectId],
      ref: "company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
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
