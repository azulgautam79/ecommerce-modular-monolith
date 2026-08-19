import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    uniqueIndex
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const accounts = pgTable('accounts', {

    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, {
            onDelete: 'cascade',
        }),

    provider: varchar('provider', { length: 50 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
},
    (table) => [
        uniqueIndex('accounts_provider_account_unique').on(
            table.provider,
            table.providerAccountId,
        )
    ]
)