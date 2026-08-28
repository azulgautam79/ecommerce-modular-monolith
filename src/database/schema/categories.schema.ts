import { pgTable, serial, integer, varchar, AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    categoryName: varchar("category_name").notNull().unique(),
    parentId: integer("parent_id").references((): AnyPgColumn => categories.id),
});

export const categoryRelations = relations(categories, ({ one, many }) => ({
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.id],
        relationName: "categoryHierarchy",
    }),
    children: many(categories, {
        relationName: "categoryHierarchy",
    }),
}));