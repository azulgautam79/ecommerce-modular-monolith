import { relations } from "drizzle-orm";
import { varchar, timestamp, integer, serial, boolean, pgTable, pgEnum, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const addresses = pgTable("addresses", {
    id: serial("id").primaryKey(),
    streetNumber: integer("street_number"),
    city: varchar("city"),
    postalCode: integer("postal_code"),
    defaultAddress: boolean("default_address").default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
    user: one(users, {
        fields: [addresses.userId],
        references: [users.id],
    }),
}));