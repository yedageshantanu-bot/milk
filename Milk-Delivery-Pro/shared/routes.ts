
import { z } from 'zod';
import { insertUserSchema, insertMilkRecordSchema, users, milkRecords } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        username: z.string().optional(),
        password: z.string().optional(),
        pin: z.string().optional(),
        type: z.enum(['owner', 'customer']),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(), // Returns the user object
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/customers' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect & { totalMilk: number, totalBill: number }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/customers' as const,
      input: z.object({
        username: z.string().min(1, "Name is required"),
        password: z.string().min(1, "Password is required"),
        rate: z.number().min(0, "Rate must be positive"),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/customers/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    get: { // For customer dashboard
        method: 'GET' as const,
        path: '/api/customers/:id' as const,
        responses: {
            200: z.custom<{
                user: typeof users.$inferSelect;
                records: typeof milkRecords.$inferSelect[];
                totalMilk: number;
                totalBill: number;
            }>(),
            404: errorSchemas.notFound
        }
    }
  },
  milk: {
    add: {
      method: 'POST' as const,
      path: '/api/milk' as const,
      input: z.object({
        userId: z.number(),
        quantity: z.number().positive("Quantity must be positive"),
        date: z.string().optional(), // YYYY-MM-DD
      }),
      responses: {
        201: z.custom<typeof milkRecords.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
