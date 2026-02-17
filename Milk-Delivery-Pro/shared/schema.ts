
import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users table (Stores both Owner and Customers)
// We will differentiate by a role field or just keep it simple as per prototype
// Prototype has "Owner" with a fixed PIN, and "Customers" with name/password.
// Let's store customers in a table. Owner auth can be handled via a special env var or simple check.
// But to be robust, let's have a users table.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Customer Name
  password: text("password").notNull(), // Stored as simple text to match prototype behavior (in production use hash)
  role: text("role").notNull().default("customer"), // 'owner' or 'customer'
  rate: integer("rate").default(0), // Rate per liter (only for customers)
  createdAt: timestamp("created_at").defaultNow(),
});

export const milkRecords = pgTable("milk_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(), // Milk in Liters
  date: date("date").defaultNow().notNull(), // Date of entry
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const usersRelations = relations(users, ({ many }) => ({
  records: many(milkRecords),
}));

export const milkRecordsRelations = relations(milkRecords, ({ one }) => ({
  user: one(users, {
    fields: [milkRecords.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertMilkRecordSchema = createInsertSchema(milkRecords).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type MilkRecord = typeof milkRecords.$inferSelect;
export type InsertMilkRecord = z.infer<typeof insertMilkRecordSchema>;

// Request types
export type CreateCustomerRequest = {
  username: string;
  password: string;
  rate: number;
};

export type AddMilkRequest = {
  userId: number;
  quantity: number;
  date?: string; // Optional, defaults to today
};

export type LoginRequest = {
  username?: string; // For customer
  password?: string; // For customer
  pin?: string;      // For owner
  type: 'owner' | 'customer';
};

// Response types
export type UserResponse = User & {
  totalMilk?: number;
  totalBill?: number;
};

export type MilkRecordResponse = MilkRecord;

export type CustomerDashboardData = {
  user: User;
  records: MilkRecord[];
  totalMilk: number;
  totalBill: number;
};

export type OwnerDashboardData = {
  customers: UserResponse[];
};
