import { pgTable, uuid, timestamp, serial, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { productVariants } from "./products.schema";

export const inventoryTransactionTypeEnum = pgEnum(
    "inventory_transaction_type_enum",
    [
        "RESTOCK",
        "SALE",
        "RESERVATION",
        "RELEASE",
        "RETURN",
        "DAMAGE",
        "ADJUSTMENT",
    ],
);

export const inventory = pgTable("inventory", {
    id: serial("id").primaryKey(),
    stock: integer("stock").notNull().default(0),
    reservedStock: integer("reserved_stock").notNull().default(0),
    variantId: uuid("variant_id")
        .notNull()
        .unique()
        .references(() => productVariants.id),
});

export const inventoryRelations = relations(inventory, ({ one }) => ({
    variant: one(productVariants, {
        fields: [inventory.variantId],
        references: [productVariants.id],
    }),
}));

export const inventoryTransactions = pgTable("inventory_transactions", {
    id: serial("id").primaryKey(),
    quantity: integer("quantity").notNull(),
    type: inventoryTransactionTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    inventoryId: integer("inventory_id")
        .notNull()
        .references(() => inventory.id),
});

export const inventoryTransactionRelations = relations(
    inventoryTransactions,
    ({ one }) => ({
        inventory: one(inventory, {
            fields: [inventoryTransactions.inventoryId],
            references: [inventory.id],
        }),
    }),
);