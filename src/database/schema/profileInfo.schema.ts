import { pgTable, uuid, text, serial } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { relations } from "drizzle-orm";

export const profileInfo = pgTable("profile_info", {
    id: serial("id").primaryKey(),
    phoneNumber: text("phone_number"),
    avatar_url: text("avatar_url"),

    userId: uuid("user_id").notNull().unique().references(() => users.id)
})

export const profileRelations = relations(profileInfo, ({ one }) => ({
    user: one(users, {
        fields: [profileInfo.userId],
        references: [users.id],
    }),
}));

export type ProfileInfo = typeof profileInfo.$inferSelect;
export type NewProfileInfo = typeof profileInfo.$inferInsert;