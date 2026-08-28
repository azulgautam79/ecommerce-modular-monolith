import { pgTable, uuid, timestamp, serial, integer, unique } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { relations } from "drizzle-orm";
import { productVariants } from "./products.schema";

export const carts = pgTable("carts", {
    id: uuid("id").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    userId: uuid("user_id")
        .notNull()
        .unique()
        .references(() => users.id),
});

export const cartRelations = relations(carts, ({ one, many }) => ({
    user: one(users, {
        fields: [carts.userId],
        references: [users.id],
    }),
    items: many(cartItems),
}));

export const cartItems = pgTable(
    "cart_items",
    {
        id: serial("id").primaryKey(),
        quantity: integer("quantity").notNull().default(1),
        cartId: uuid("cart_id")
            .notNull()
            .references(() => carts.id),
        variantId: uuid("variant_id")
            .notNull()
            .references(() => productVariants.id),
    },
    (table) => ({
        cartVariantUnique: unique().on(table.cartId, table.variantId),
    }),
);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    cart: one(carts, {
        fields: [cartItems.cartId],
        references: [carts.id],
    }),
    variant: one(productVariants, {
        fields: [cartItems.variantId],
        references: [productVariants.id],
    }),
}));