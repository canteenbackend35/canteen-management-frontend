import { z } from "zod";

/**
 * Reusable Basic Schemas
 */
export const phoneSchema = z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits");

export const roleSchema = z.enum(["customer", "store"], {
  message: "Role must be 'customer' or 'store'",
});

export const numericIdSchema = z.string().regex(/^\d+$/, "ID must be a numeric string");

export const otpSchema = (length: number = 4) => 
  z.string().length(length, `OTP must be exactly ${length} digits`);

/**
 * Auth Schemas
 */
export const sendOtpSchema = z.object({
  phoneNo: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phoneNo: phoneSchema,
  otp: z.string().min(4, "OTP is required"),
  reqId: z.string().min(1, "Request ID is required"),
  role: roleSchema,
});

export const loginSchema = z.object({
  phoneNo: phoneSchema,
  role: roleSchema,
});

export const signupSchema = z.object({
  phoneNo: phoneSchema,
  role: roleSchema,
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
  course: z.string().optional().nullable(),
  college: z.string().optional().nullable(),
}).refine((data) => {
  if (data.role === 'customer') {
    return !!data.email && !!data.name;
  }
  return true;
}, {
  message: "Email and name are required for customer signup",
  path: ["email"],
});

/**
 * Menu Schemas
 */
export const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  status: z.preprocess(
    (val) => (typeof val === "string" ? val.toUpperCase() : val),
    z.enum(["AVAILABLE", "OUT_OF_STOCK"])
  ).optional(),
});

/**
 * Order Schemas
 */
export const createOrderSchema = z.object({
  customer_id: z.number().int().positive().optional(),
  store_id: z.number().int().positive(),
  payment_id: z.string().optional(),
  items: z.array(
    z.object({
      menu_item_id: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "At least one item is required"),
});

export const verifyOrderSchema = z.object({
  order_otp: otpSchema(4),
});

/**
 * Store Schemas
 */
export const updateStoreStatusSchema = z.object({
  status: z.enum(["OPEN", "CLOSED"], {
    message: "Status must be either OPEN or CLOSED",
  }),
});
