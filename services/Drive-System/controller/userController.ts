//libraries imports
import { Request, Response } from "express";
//schema import
import { User } from "../schema/userSchema";

export const registerUserAPI = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = user.generateToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
};

export const loginUserAPI = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      res.status(400).send({ error: "Invalid credentials" });
      return;
    }

    const token = await user.generateToken();
    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
};

export const log = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).send({ message: "hello from drive server" });
  } catch (error) {
    res.status(400).send(error);
  }
};
