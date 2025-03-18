import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const TokenType = {
  USER: process.env.USER_SECRET,
  OWNER: process.env.COMPANY_SECRET,
} as const;

enum ExpiryOption {
  oneMinute = 60, // JWT expects seconds
  oneHour = 60 * 60,
  oneMonth = 60 * 60 * 24 * 30,
}

export async function generateToken(
  data: object,
  type: keyof typeof TokenType,
  expiresIn: ExpiryOption
): Promise<string> {
  if (!TokenType[type]) {
    throw new Error(`Invalid token type: ${type}`);
  }

  return jwt.sign(data, TokenType[type] as string, { expiresIn });
}

export async function verifyToken(token: string, type: keyof typeof TokenType) {
  if (!TokenType[type]) {
    throw new Error(`Invalid token type: ${type}`);
  }

  try {
    const decoded = jwt.verify(
      token,
      TokenType[type] as string
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

export { ExpiryOption };
