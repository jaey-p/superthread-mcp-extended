# AGENTS.md - Development Guide for Superthread MCP Server

## Commands

- `bun run dev` / `bun start` - Start local development server
- `bun run build` - Build for production using esbuild
- `bun run format` - Format code with Biome
- `bun run lint:fix` - Lint and auto-fix issues
- `bun run type-check` - Run TypeScript type checking
- `bun test` - Run health check (requires server running)
- `bun run deploy` - Deploy to Cloudflare Workers

## Code Style

- **Formatting**: 4-space indentation, 100-character line width (Biome configured)
- **TypeScript**: Strict mode enabled, target ES2021, module ES2022
- **Imports**: Use `.js` extensions for local imports, explicit type imports with `import type`
- **Validation**: Use Zod schemas for input validation, export schemas with descriptive names
- **Naming**: camelCase for functions/variables, PascalCase for classes/types, snake_case for API endpoints
- **Error Handling**: Custom error classes (e.g., `SuperthreadAPIError`), descriptive error messages
- **Structure**: Organize by feature (`tools/`, `types/`, `lib/`), register tools in `server.ts`
- **MCP Tools**: Export tool functions and registration functions separately, include detailed descriptions
- **API Client**: Use centralized `apiClient` from `lib/api-client.ts`, include proper auth token handling
