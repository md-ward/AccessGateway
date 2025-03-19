import { ExpiryOption, generateToken, verifyToken } from "./generateTokens";

async function test(): Promise<string> {
  const userData = { id: 123, role: "admin" };

  const token = await generateToken(userData, "USER", ExpiryOption.oneMonth);
  console.log(token);
  return token;
}

async function decodeToken() {
  const token = await test();
  const decoded = await verifyToken(token, "USER");
  console.log(decoded);
}

decodeToken();
