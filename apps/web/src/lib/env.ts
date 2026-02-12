import { z } from "zod";

const isTest = process.env["NODE_ENV"] === "test" || process.env["VITEST"] === "true";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  APP_NAME: z.string().min(1).default("My App"),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env["DATABASE_URL"] ?? (isTest ? "postgresql://postgres:postgres@localhost:5432/av_stack" : undefined),
  BETTER_AUTH_SECRET: process.env["BETTER_AUTH_SECRET"] ?? (isTest ? "test-secret-123456" : undefined),
  BETTER_AUTH_URL: process.env["BETTER_AUTH_URL"] ?? (isTest ? "http://localhost:3000" : undefined),
  APP_NAME: process.env["APP_NAME"] ?? "My App",
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => issue.message).join(", ");
  throw new Error(`Invalid app environment: ${issues}`);
}

export const env = parsed.data;
