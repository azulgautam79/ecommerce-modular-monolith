import { relations } from "drizzle-orm";
import { varchar, timestamp, pgTable, pgEnum, uuid } from "drizzle-orm/pg-core";
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

    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),

    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    role: userRoleEnum("role").default("CUSTOMER"),

    passwordHash: varchar('password_hash', { length: 255 }),

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