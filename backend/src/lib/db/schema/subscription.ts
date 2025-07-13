import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
]);

export const subscription = pgTable("subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .notNull()
    .default("free"),
  usage: integer("usage").notNull().default(0),
  usageLimit: integer("usage_limit").notNull().default(50),
});

export type Subscription = typeof subscription.$inferSelect;
export type SubscriptionInsert = typeof subscription.$inferInsert;
