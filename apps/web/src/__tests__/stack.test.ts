import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "../server/router";

describe("tRPC appRouter", () => {
  const anonymousCaller = appRouter.createCaller({ session: null });

  const superuserCaller = appRouter.createCaller({
    session: {
      session: {
        id: "session-1",
        userId: "user-1",
        token: "token",
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        ipAddress: null,
        userAgent: null,
      },
      user: {
        id: "user-1",
        name: "Admin",
        email: "admin@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: true,
        image: null,
      },
    },
  });

  it("health check returns ok", async () => {
    const result = await anonymousCaller.health();
    expect(result.status).toBe("ok");
    expect(result.timestamp).toBeDefined();
  });

  it("hello returns greeting", async () => {
    const result = await anonymousCaller.hello({ name: "Test" });
    expect(result.greeting).toBe("Hello, Test!");
  });

  it("hello returns default greeting", async () => {
    const result = await anonymousCaller.hello({});
    expect(result.greeting).toBe("Hello, world!");
  });

  it("stack returns all items", async () => {
    const result = await anonymousCaller.stack();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]).toHaveProperty("name");
    expect(result.items[0]).toHaveProperty("description");
    expect(result.items[0]).toHaveProperty("category");
  });

  it("admin users query is protected", async () => {
    await expect(anonymousCaller.admin.users()).rejects.toBeInstanceOf(TRPCError);
  });

  it("me returns current user for signed in session", async () => {
    const result = await superuserCaller.me();
    expect(result.user.email).toBe("admin@example.com");
  });
});
