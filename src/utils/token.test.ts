import { ExpiryOption, generateToken, verifyToken } from "./generateTokens";

async function test(): Promise<string> {
  const userData = { id: 123, role: "admin" };

  const token = await generateToken(userData, "USER", ExpiryOption.oneMinute);
  console.log(token);
  return token;
}

async function decodeToken() {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDIzMTgzMjUsImV4cCI6MTc0MjMxODM4NX0.Qb-QpEAokIWMUno_iyphfi7oEmgrAhIYFKiK98hefA0";
  const decoded = await verifyToken(token, "USER");
  console.log(decoded);
}

decodeToken();
