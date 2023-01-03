import { Role, UserId } from "src/api";

export class Account {
    userId: UserId;
    name: string;
    email: string;
    role: Role;
    token?: string;
    refreshToken?: string;
    isVerified: boolean;
    requestedAccess: boolean;
}
