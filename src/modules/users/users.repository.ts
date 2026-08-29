import { Inject, Injectable } from "@nestjs/common";
import { users } from "../../database/schema";
import type { User } from "../../database/schema";
import { eq, inArray } from "drizzle-orm";
import { DRIZZLE_CLIENT, type DrizzleDatabase } from "../../database/database.types";

@Injectable()
export class UsersRepository {
    constructor(
        @Inject(DRIZZLE_CLIENT)
        private readonly db: DrizzleDatabase,
    ) { }

    //! Find All Users
    async findAllUsers(): Promise<User[]> {
        const allUsers = await this.db
            .select()
            .from(users);

        return allUsers;
    }

    //! Find by email
    async findByEmail(email: string): Promise<User | undefined> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user;
    }

    //! Find By Id
    async findById(id: string): Promise<User | undefined> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return user;
    }

    //! Find By GoogleId
    async findByGoogleId(googleId: string): (Promise<User | undefined>) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.googleId, googleId))
            .limit(1);

        return user;
    }

    //! Find By GithubId
    async findByGithubId(githubId: string): (Promise<User | undefined>) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.githubId, githubId))
            .limit(1);

        return user;
    }

    //! Create user
    async createWithPassword(data: {
        userName: string;
        email: string;
        passwordHash: string;
    }) {
        const [user] = await this.db
            .insert(users)
            .values({
                userName: data.userName,
                email: data.email,
                passwordHash: data.passwordHash,
            })
            .returning();

        return user;
    }

    //! Verify Email
    async setEmailVerificationToken(
        userId: string,
        tokenHash: string,
        expiresAt: Date,
    ): Promise<void> {
        await this.db
            .update(users)
            .set({
                emailVerificationTokenHash: tokenHash,
                emailVerificationTokenExpiresAt: expiresAt,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
    }

    //! After verifying the user
    async verifyEmail(userId: string): Promise<void> {
        await this.db
            .update(users)
            .set({
                emailVerified: true,
                emailVerificationTokenHash: null,
                emailVerificationTokenExpiresAt: null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
    }

    //! Find Email Verification Token
    async findByEmailVerificationToken(
        tokenHash: string,
    ) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(
                eq(
                    users.emailVerificationTokenHash,
                    tokenHash,
                ),
            )
            .limit(1);

        return user;
    }

    //! Create OAuth User
    async createOAuthUser(data: {
        userName: string;
        email: string;
        avatarUrl?: string;
        googleId?: string;
        githubId?: string;
    }): Promise<User> {

        const [user] = await this.db
            .insert(users)
            .values({
                userName: data.userName,
                email: data.email,
                avatarUrl: data.avatarUrl,
                googleId: data.googleId,
                githubId: data.githubId,
            })
            .returning();

        return user;
    }

    //! Link GoogleId
    async linkGoogleId(userId: string, googleId: string): Promise<void> {
        await this.db
            .update(users)
            .set({ googleId, updatedAt: new Date() })
            .where(eq(users.id, userId))
    }

    //! Link GithubId
    async linkGithubId(userId: string, githubId: string): Promise<void> {
        await this.db
            .update(users)
            .set({ githubId, updatedAt: new Date() })
            .where(eq(users.id, userId))
    }

    //! Update Refresh Token Hash
    async updateRefreshTokenHash(userId: string, refreshTokenHash: string): Promise<void> {
        await this.db
            .update(users)
            .set({ refreshTokenHash, updatedAt: new Date() })
            .where(eq(users.id, userId));
    }

    //! Clear Refresh Token Hash
    async clearRefreshTokenHash(userId: string): Promise<void> {
        await this.db
            .update(users)
            .set({ refreshTokenHash: null, updatedAt: new Date() })
            .where(eq(users.id, userId));
    }

    //! Set Password Reset Token
    async setPasswordResetToken(
        userId: string,
        passwordResetTokenHash: string,
        passwordResetTokenExpiresAt: Date,
    ): Promise<void> {
        await this.db
            .update(users)
            .set({
                passwordResetTokenHash,
                passwordResetTokenExpiresAt,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
    }

    //! Reset Password 
    async resetPassword(userId: string, passwordHash: string): Promise<void> {
        await this.db
            .update(users)
            .set({
                passwordHash,
                passwordResetTokenHash: null,
                passwordResetTokenExpiresAt: null,
                refreshTokenHash: null,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
    }

    //! Delete User
    async deleteUser(userId: string): Promise<User | undefined> {
        const [deletedUser] = await this.db
            .delete(users)
            .where(eq(users.id, userId))
            .returning();

        return deletedUser;
    }

    //! Delete Many Users
    async deleteManyUsers(userIds: string[]): Promise<User[]> {
        const deletedUsers = await this.db
            .delete(users)
            .where(inArray(users.id, userIds))
            .returning();

        return deletedUsers;
    }



};