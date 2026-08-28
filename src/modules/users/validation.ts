import { z } from "zod";

export const CEFRLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  currentCEFRLevel: z.enum(CEFRLevels),
  targetCEFRLevel: z.enum(CEFRLevels),
  dailyMinutes: z
    .number()
    .int()
    .min(10, "Daily practice must be at least 10 minutes")
    .max(180, "Daily practice cannot exceed 180 minutes"),
  timezone: z.string().min(1, "Timezone is required"),
  nativeLanguage: z.string().min(2).max(10).default("es"),
  onboarded: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
