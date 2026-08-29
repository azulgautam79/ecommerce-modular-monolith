import { pgTable, uuid, timestamp, varchar, integer, text, numeric, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "./categories.schema";
import { inventory } from "./inventory.schema";

export const products = pgTable("products", {
    id: uuid("id").primaryKey(),
    productName: varchar("product_name").notNull(),
    productDescription: text("product_description"),

    categoryId: integer("category_id")
        .notNull()
        .references(() => categories.id),
});

export const productRelations = relations(products, ({ one, many }) => ({
    productImages: many(productImages),
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    // inventory: one(inventory),
    variants: many(productVariants),
}));

export const productVariants = pgTable("product_variants", {
    id: uuid("id").primaryKey(),
    // SKU = Stock Keeping Unit
    sku: varchar("sku").notNull().unique(),
    variantName: varchar("variant_name").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),

    productId: uuid("product_id")
        .notNull()
        .references(() => products.id),
});

export const productVariantsRelations = relations(
    productVariants,
    ({ one }) => ({
        product: one(products, {
            fields: [productVariants.productId],
            references: [products.id],
        }),
        inventory: one(inventory),
    }),
);

export const productImages = pgTable("product_images", {
    id: serial("id").primaryKey(),
    imageUrl: text("image_url"),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id),
});

export const productImageRelations = relations(
    productImages,
    ({ one }) => ({
        product: one(products, {
            fields: [productImages.productId],
            references: [products.id],
        }),
    }),
);