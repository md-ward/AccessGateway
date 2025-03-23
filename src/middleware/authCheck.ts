import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies.token;    

  try {
    if (!token) {
      res.status(400).send({
        valid: false,
        expired: false,
        error: "No token provided",
      });
    }
    const decoded = jwt.verify(
      token,

      process.env.COMPANY_SECRET as string
    ) as jwt.JwtPayload;

    // Check expiry using JWT's built-in exp field
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      res.status(400).send({
        valid: false,
        expired: true,
        error: "Token has expired",
      });
    }

    req.body.valid = {
      valid: true,
      expired: false,
      decoded,
    };
    next();
  } catch (error) {
    res.status(400).send({
      valid: false,
      expired: error instanceof jwt.TokenExpiredError,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}

export async function checkToken(token: string) {
  try {
    if (!token) {
      return {
        valid: false,
        expired: false,
        error: "No token provided",
      };
    }
    const decoded = jwt.verify(
      token,

      process.env.COMPANY_SECRET as string
    ) as jwt.JwtPayload;

    // Check expiry using JWT's built-in exp field
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return {
        valid: false,
        expired: true,
        error: "Token has expired",
      };
    }

    return {
      valid: true,  
      expired: false,
      decoded,
    };
  } catch (error) {
    return {
      valid: false,
      expired: error instanceof jwt.TokenExpiredError,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
