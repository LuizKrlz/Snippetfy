import { z } from "zod";

/** Legacy: POST /register — auth/signup.njk */
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/** Legacy: POST /authenticate — auth/signin.njk */
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const userPublicSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  email: z.string().email(),
});
