import { pgTable, uuid, timestamp, numeric, varchar, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders } from "./orders.schema";

export const paymentStatusEnum = pgEnum("payment_status_enum", [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
]);

export const paymentMethodEnum = pgEnum("payment_method_enum", [
    "CASH_ON_DELIVERY",
    "CARD",
    "BANK_TRANSFER",
    "WALLET",
]);

export const payments = pgTable("payments", {
    id: uuid("id").primaryKey(),

    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id),

    method: paymentMethodEnum("method").notNull(),

    status: paymentStatusEnum("status").notNull().default("PENDING"),

    amount: numeric("amount", {
        precision: 12,
        scale: 2,
    }).notNull(),

    transactionId: varchar("transaction_id").unique(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paymentRelations = relations(payments, ({ one }) => ({
    order: one(orders, {
        fields: [payments.orderId],
        references: [orders.id],
    }),
}));