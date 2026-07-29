/**
 * Minimal type declarations for pi-agent extension API.
 * These are used during development (tsc --noEmit).
 * At runtime, pi-agent provides the full types via jiti.
 */

declare module "@earendil-works/pi-coding-agent" {
  export interface ExtensionAPI {
    on(event: string, handler: (...args: any[]) => any): void;
    registerTool(def: ToolDef): void;
    registerCommand(
      name: string,
      def: { description?: string; handler: (args: string, ctx: any) => Promise<void> },
    ): void;
  }

  export interface ToolDef {
    name: string;
    label: string;
    description: string;
    parameters: any;
    execute(
      toolCallId: string,
      params: any,
      signal?: AbortSignal,
      onUpdate?: (update: any) => void,
      ctx?: any,
    ): Promise<ToolResult>;
  }

  export interface ToolResult {
    content: Array<{ type: string; text: string }>;
    details?: Record<string, unknown>;
  }
}
