import { z } from "zod";

const isTest = process.env["NODE_ENV"] === "test" || process.env["VITEST"] === "true";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env["DATABASE_URL"] ?? (isTest ? "postgresql://postgres:postgres@localhost:5432/av_stack" : undefined),
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue: { message: string }) => issue.message).join(", ");
  throw new Error(`Invalid database environment: ${issues}`);
}

export const env = parsed.data;
