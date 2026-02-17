
import { db } from "./db";
import {
  users,
  milkRecords,
  type User,
  type InsertUser,
  type MilkRecord,
  type InsertMilkRecord,
  type CreateCustomerRequest,
  type AddMilkRequest
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createCustomer(user: CreateCustomerRequest): Promise<User>;
  getAllCustomers(): Promise<User[]>;
  deleteCustomer(id: number): Promise<void>;

  // Milk operations
  addMilkRecord(record: AddMilkRequest): Promise<MilkRecord>;
  getMilkRecords(userId: number): Promise<MilkRecord[]>;
  
  // Aggregations
  getCustomerStats(userId: number): Promise<{ totalMilk: number; totalBill: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createCustomer(data: CreateCustomerRequest): Promise<User> {
    const [user] = await db.insert(users).values({
      username: data.username,
      password: data.password,
      rate: data.rate,
      role: 'customer'
    }).returning();
    return user;
  }

  async getAllCustomers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'customer'));
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(milkRecords).where(eq(milkRecords.userId, id)); // Delete records first
    await db.delete(users).where(eq(users.id, id));
  }

  async addMilkRecord(data: AddMilkRequest): Promise<MilkRecord> {
    const [record] = await db.insert(milkRecords).values({
      userId: data.userId,
      quantity: data.quantity.toString(),
      date: data.date || new Date().toISOString().split('T')[0]
    }).returning();
    return record;
  }

  async getMilkRecords(userId: number): Promise<MilkRecord[]> {
    return await db.select()
      .from(milkRecords)
      .where(eq(milkRecords.userId, userId))
      .orderBy(desc(milkRecords.date));
  }

  async getCustomerStats(userId: number): Promise<{ totalMilk: number; totalBill: number }> {
    const user = await this.getUser(userId);
    if (!user) return { totalMilk: 0, totalBill: 0 };

    const records = await this.getMilkRecords(userId);
    const totalMilk = records.reduce((sum, r) => sum + Number(r.quantity), 0);
    const totalBill = totalMilk * (user.rate || 0);

    return { totalMilk, totalBill };
  }
}

export const storage = new DatabaseStorage();
