import { Request, Response } from "express";
import { User } from "../schema/userSchema";
import bcrypt from "bcrypt";
import { ExpiryOption, generateToken } from "../utils/generateTokens";
import { UserToken } from "../utils/types";
import { Schema } from "mongoose";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await generateToken(
      {
        id: user.id,
        role: user.role,
        services: user.services,
        company: user.comp.map((comp: Schema.Types.ObjectId) =>
          comp.toString()
        ),
        name: user.name,
      } as UserToken,
      ExpiryOption.oneMonth
    );
    res.cookie("token", token, { httpOnly: true });
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send(error);
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password as string);
      if (isMatch && email === user.email) {
        const token = await generateToken(
          {
            id: user.id,
            role: user.role,
            services: user.services, 
            company: user.comp.map((comp: Schema.Types.ObjectId) =>
              comp.toString()
            ),
            name: user.name,
          } as UserToken,
          ExpiryOption.oneMonth
        );
        // console.log({
        //   id: user.id,
        //   role: user.role,
        //   services: user.services,
        //   company: user.comp.map((comp: Schema.Types.ObjectId) =>
        //     comp.toString()
        //   ),
        //   name: user.name,
        // } as UserToken);

        res.cookie("token", token, { httpOnly: true });
        res.status(200).send({ message: "Login successful" });
      }
    } else {
      res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};
