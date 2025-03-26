import { Role } from "../schema/userSchema";

interface UserToken {
  id: string;
  role: Role;
  name: string;
  company: string[];
}

export { UserToken };
