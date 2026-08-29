import { Request } from "express";
import { UserRole } from "../enums/user-role.enum";

export type AuthenticatedUser = {
    id: string;
    email: string;
    userName: string;
    role: UserRole;
    avatarUrl: string | null;
};

export type AuthenticatedRequest =
    Request & {
        user: AuthenticatedUser;
    };