/**
 * Integration tests for the pi-agent extension entry point.
 * Verifies command handling, skill-file injection, and mode toggling
 * against a mocked ExtensionAPI.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import extensionFactory from "./index.js";

interface Handlers {
  commands: Map<string, { handler: (args: string, ctx: unknown) => Promise<void> }>;
  events: Map<string, (event: unknown, ctx: unknown) => Promise<unknown>>;
}

function createMockPi(): { pi: unknown; handlers: Handlers } {
  const handlers: Handlers = { commands: new Map(), events: new Map() };
  const pi = {
    registerCommand(name: string, def: { handler: (args: string, ctx: unknown) => Promise<void> }) {
      handlers.commands.set(name, def);
    },
    registerTool: vi.fn(),
    on(event: string, handler: (event: unknown, ctx: unknown) => Promise<unknown>) {
      handlers.events.set(event, handler);
    },
  };
  return { pi, handlers };
}

function mockCtx() {
  return {
    ui: {
      notify: vi.fn(),
      setStatus: vi.fn(),
    },
  };
}

describe("pi-stop-slop extension", () => {
  let handlers: Handlers;

  beforeEach(() => {
    const mock = createMockPi();
    handlers = mock.handlers;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensionFactory(mock.pi as any);
  });

  it("registers the stop-slop command", () => {
    expect(handlers.commands.has("stop-slop")).toBe(true);
  });

  it("registers before_agent_start and session hooks", () => {
    expect(handlers.events.has("before_agent_start")).toBe(true);
    expect(handlers.events.has("session_start")).toBe(true);
    expect(handlers.events.has("session_shutdown")).toBe(true);
  });

  it("does not inject a system prompt when mode is off", async () => {
    const hook = handlers.events.get("before_agent_start")!;
    const result = await hook({ systemPrompt: "base" }, mockCtx());
    expect(result).toBeUndefined();
  });

  it("injects skill file content into the system prompt when strict mode is active", async () => {
    const cmd = handlers.commands.get("stop-slop")!;
    const ctx = mockCtx();
    await cmd.handler("strict", ctx);
    expect(ctx.ui.setStatus).toHaveBeenCalledWith("stop-slop", "[STE:STRICT]");

    const hook = handlers.events.get("before_agent_start")!;
    const result = (await hook({ systemPrompt: "base" }, mockCtx())) as {
      systemPrompt: string;
    };

    expect(result.systemPrompt).toContain("base");
    expect(result.systemPrompt).toContain("ASD-STE100");
    expect(result.systemPrompt).toContain("STRICT mode");
  });

  it("injects flavored mode reminder when flavored mode is active", async () => {
    const cmd = handlers.commands.get("stop-slop")!;
    const ctx = mockCtx();
    await cmd.handler("flavored", ctx);

    const hook = handlers.events.get("before_agent_start")!;
    const result = (await hook({ systemPrompt: "base" }, mockCtx())) as {
      systemPrompt: string;
    };
    expect(result.systemPrompt).toContain("FLAVORED mode");
  });

  it("stops injecting after mode is turned off", async () => {
    const cmd = handlers.commands.get("stop-slop")!;
    await cmd.handler("strict", mockCtx());
    await cmd.handler("off", mockCtx());

    const hook = handlers.events.get("before_agent_start")!;
    const result = await hook({ systemPrompt: "base" }, mockCtx());
    expect(result).toBeUndefined();
  });

  it("shows setup text without changing mode", async () => {
    const cmd = handlers.commands.get("stop-slop")!;
    const ctx = mockCtx();
    await cmd.handler("setup", ctx);
    expect(ctx.ui.notify).toHaveBeenCalled();
    expect(ctx.ui.setStatus).not.toHaveBeenCalled();
  });

  it("isolates state across separate factory instantiations", async () => {
    // Simulates two independent pi sessions loading the same extension.
    const sessionA = createMockPi();
    const sessionB = createMockPi();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensionFactory(sessionA.pi as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensionFactory(sessionB.pi as any);

    await sessionA.handlers.commands.get("stop-slop")!.handler("strict", mockCtx());

    const hookA = sessionA.handlers.events.get("before_agent_start")!;
    const hookB = sessionB.handlers.events.get("before_agent_start")!;

    const resultA = (await hookA({ systemPrompt: "base" }, mockCtx())) as {
      systemPrompt: string;
    };
    const resultB = await hookB({ systemPrompt: "base" }, mockCtx());

    expect(resultA.systemPrompt).toContain("STRICT mode");
    expect(resultB).toBeUndefined(); // session B never activated a mode
  });
});
