# Prompt for Codex 5.3 (Continuation)

You are a senior engineer continuing work in `/Users/kyohah/ghq/github.com/kyohah/process-compose-mcp`.
The repository already has:
- `package.json`, `tsconfig.json`
- `src/pcClient.ts` implementing OpenAPI discovery + endpoint resolution
- `src/tools/pcTools.ts` implementing MCP tool handlers and input validation
- `README.md` describing current state

## Your Tasks
1. Implement MCP server entry point in `src/index.ts` using `@modelcontextprotocol/sdk` with stdio transport.
   - Load `PcClient.createFromEnv()` at startup.
   - Register tools from `pcTools.ts`.
   - On tool invocation, call `handleToolCall()` and return JSON results.
   - If OpenAPI discovery fails, return a clear startup error and exit.
2. Ensure tool responses are easy for Claude to read (JSON with clear keys).
3. Update README to include:
   - Install & build steps
   - Env vars (`PC_API_BASE_URL`, `PC_OPENAPI_URL`, `PC_API_TOKEN`)
   - Claude Code MCP config example (stdio command)
   - Troubleshooting (OpenAPI not found / port mismatch)
   - Sample local usage commands
4. Keep dependencies minimal; use built-in `fetch`. No local log file reading.

## Constraints
- Must require process name for destructive actions.
- No bulk stop/restart tools.
- Ensure 10s timeout is retained (already in `pcClient.ts`).
- For 404, suggest process names if possible (already in tool handlers).

## Useful Files
- `src/pcClient.ts`
- `src/tools/pcTools.ts`
- `README.md`

## Expected Output
Working MCP server executable via `node dist/index.js` after `npm run build`.
