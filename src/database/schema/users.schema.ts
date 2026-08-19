import { varchar, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),

    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),

    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),

    passwordHash: varchar('password_hash', { length: 255 }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})