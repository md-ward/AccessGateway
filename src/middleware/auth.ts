import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Role, User } from "../schema/userSchema";
import dotenv from "dotenv";

dotenv.config();

// Extend Request Type
export interface AuthRequest extends Request {
  user: User;
  token?: string;
}

// **Middleware: Verify Token**
async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthRequest;
  try {
    const token = req.cookies.token;
    console.log(token);

    if (!token) {
      res.status(401).send({ error: "No token provided" });
    }

    if (!token) {
      res.status(401).send({ error: "No token provided" });
    }

    if (token) {
      console.log("hello from hebad");

      const decoded = jwt.verify(
        token,
        process.env.COMPANY_SECRET as string
      ) as JwtPayload;
      console.log(decoded);

      const user = await User.findById(decoded.id);

      if (!user) {
        console.log("no user found");
        res.status(401).send({ error: "Unauthorized" });
      }

      authReq.token = token;
      if (user) {
        if (user.role == Role.OWNER || user.role == Role.ADMIN) {
          authReq.user = user;
        } else {
          res.status(401).send({ error: "Unauthorized" });
          console.log("error role");
        }
      }
    }
    next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    res.status(401).send({ error: error });
  }
}

export default verifyToken;
