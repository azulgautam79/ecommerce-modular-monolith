import { relations } from "drizzle-orm";
import { varchar, timestamp, pgTable, pgEnum, uuid, boolean } from "drizzle-orm/pg-core";
import { profileInfo } from "./profileInfo.schema";
import { addresses } from "./addresses.schema";
import { carts } from "./carts.schema";
import { orders } from "./orders.schema";


export const userRoleEnum = pgEnum("user_role_enum", [
    "CUSTOMER",
    "ADMIN",
    "SUPPORT",
    "VENDOR",
]);

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),

    userName: varchar('user_name', { length: 100 }).notNull(),

    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),

    emailVerificationTokenHash: varchar(
        "email_verification_token_hash",
        { length: 255 },
    ),

    emailVerificationTokenExpiresAt: timestamp(
        "email_verification_token_expires_at",
        { withTimezone: true },
    ),

    role: userRoleEnum("role").notNull().default("CUSTOMER"),

    passwordHash: varchar('password_hash', { length: 255 }),
    googleId: varchar('google_id', { length: 255 }).unique(),
    githubId: varchar('github_id', { length: 255 }).unique(),
    avatarUrl: varchar("avatar_url", { length: 512 }),

    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),

    passwordResetTokenHash: varchar('password_reset_token_hash', { length: 255 }),
    passwordResetTokenExpiresAt: timestamp('password_reset_token_expires_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
    // 1 User 1 profile
    profile: one(profileInfo),
    // 1 User many addresses
    addresses: many(addresses),
    // 1 User 1 profile
    cart: one(carts),
    // 1 User many orders
    orders: many(orders),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;