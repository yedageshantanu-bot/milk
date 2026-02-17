
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

const OWNER_PIN = "1234";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth / Login
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);

      if (input.type === 'owner') {
        if (input.pin === OWNER_PIN) {
          // Return a dummy owner user
          const ownerUser = {
            id: 0,
            username: 'Owner',
            role: 'owner',
            password: '',
            rate: 0,
            createdAt: new Date(),
          };
          return res.json(ownerUser);
        } else {
          return res.status(401).json({ message: "Invalid PIN" });
        }
      } else {
        // Customer Login
        if (!input.username || !input.password) {
          return res.status(400).json({ message: "Username and password required" });
        }
        const user = await storage.getUserByUsername(input.username);
        if (user && user.password === input.password && user.role === 'customer') {
           return res.json(user);
        } else {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      }
    } catch (err) {
       return res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    // In a real app with session, destroy session. Here frontend handles state.
    res.json({ message: "Logged out" });
  });

  // Customers List
  app.get(api.customers.list.path, async (req, res) => {
    const customers = await storage.getAllCustomers();
    // Enrich with stats if needed, or keeping it simple for list
    // For list, we might just want basic info. 
    // If stats are needed, we can map over them.
    const result = await Promise.all(customers.map(async (c) => {
        const stats = await storage.getCustomerStats(c.id);
        return { ...c, ...stats };
    }));
    res.json(result);
  });

  // Create Customer
  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Customer already exists" });
      }
      const user = await storage.createCustomer(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete Customer
  app.delete(api.customers.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteCustomer(id);
    res.status(204).send();
  });
  
  // Get Single Customer Dashboard Data
  app.get(api.customers.get.path, async (req, res) => {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      if(!user) return res.status(404).json({ message: "User not found" });
      
      const records = await storage.getMilkRecords(id);
      const stats = await storage.getCustomerStats(id);
      
      res.json({
          user,
          records,
          totalMilk: stats.totalMilk,
          totalBill: stats.totalBill
      });
  });

  // Add Milk
  app.post(api.milk.add.path, async (req, res) => {
    try {
      const input = api.milk.add.input.parse(req.body);
      const user = await storage.getUser(input.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const record = await storage.addMilkRecord(input);
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

// Seed function
async function seed() {
    const existing = await storage.getAllCustomers();
    if (existing.length === 0) {
        const user = await storage.createCustomer({
            username: "Raju",
            password: "123",
            rate: 60
        });
        await storage.addMilkRecord({
            userId: user.id,
            quantity: 1.5,
            date: new Date().toISOString().split('T')[0]
        });
        await storage.addMilkRecord({
            userId: user.id,
            quantity: 2.0,
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0] 
        });
    }
}

// Run seed
seed().catch(console.error);
