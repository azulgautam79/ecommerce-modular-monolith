import { pgTable, uuid, timestamp, serial, integer, pgEnum, numeric, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { relations } from "drizzle-orm";
import { addresses } from "./addresses.schema";
import { payments } from "./payments.schema";
import { productVariants } from "./products.schema";

export const orderStatusEnum = pgEnum("order_status_enum", [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
]);

export const orders = pgTable("orders", {
    id: uuid("id").primaryKey(),
    status: orderStatusEnum("status").notNull().default("PENDING"),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),

    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    shippingAddressId: integer("shipping_address_id")
        .notNull()
        .references(() => addresses.id),
});

export const orderRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    shippingAddress: one(addresses, {
        fields: [orders.shippingAddressId],
        references: [addresses.id],
    }),
    items: many(orderItems),
    payments: many(payments),
}));

export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }),
    productName: varchar("product_name").notNull(),
    variantName: varchar("variant_name").notNull(),
    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id),
    variantId: uuid("variant_id")
        .notNull()
        .references(() => productVariants.id),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),

    variant: one(productVariants, {
        fields: [orderItems.variantId],
        references: [productVariants.id],
    }),
}));