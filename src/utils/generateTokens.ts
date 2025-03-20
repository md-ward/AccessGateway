import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

enum ExpiryOption {
  oneMinute = 60, // JWT expects seconds
  oneHour = 60 * 60,
  oneMonth = 60 * 60 * 24 * 30,
}

export async function generateToken(
  data: object,
  expiresIn: ExpiryOption
): Promise<string> {
  return jwt.sign(data, process.env.COMPANY_SECRET as string, { expiresIn });
}


export { ExpiryOption };
