import { describe, expect, it } from "vitest";
import { appRouter } from "../server/router";

describe("tRPC appRouter", () => {
  const caller = appRouter.createCaller({});

  it("health check returns ok", async () => {
    const result = await caller.health();
    expect(result.status).toBe("ok");
    expect(result.timestamp).toBeDefined();
  });

  it("hello returns greeting", async () => {
    const result = await caller.hello({ name: "Test" });
    expect(result.greeting).toBe("Hello, Test!");
  });

  it("hello returns default greeting", async () => {
    const result = await caller.hello({});
    expect(result.greeting).toBe("Hello, world!");
  });

  it("stack returns all items", async () => {
    const result = await caller.stack();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]).toHaveProperty("name");
    expect(result.items[0]).toHaveProperty("description");
    expect(result.items[0]).toHaveProperty("category");
  });
});
