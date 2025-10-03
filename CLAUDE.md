# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Superthread MCP Extended is an enhanced Model Context Protocol (MCP) server that provides comprehensive CRUD operations for Superthread's project management API. It's deployed as a Cloudflare Worker and serves as a drop-in replacement for the official Superthread MCP with optimized responses that reduce token usage by 60-80%.

**Key Architecture**: JSON-RPC 2.0 server deployed to Cloudflare Workers that proxies and optimizes Superthread API calls.

## Development Commands

### Running locally
```bash
bun run dev           # Start Wrangler dev server on localhost:8787
bun run start         # Alias for dev
```

### Building
```bash
bun run build         # Bundle with esbuild (outputs to dist/index.js)
bun run type-check    # Run TypeScript compiler without emitting files
```

### Deployment
```bash
bun run deploy        # Deploy to Cloudflare Workers (production)
```

### Code Quality
```bash
bun run format        # Format code with Biome
bun run lint:fix      # Fix linting issues with Biome
```

### Testing
```bash
bun run test          # Health check (curl localhost:8787/health)
```

## Code Architecture

### Entry Point & Request Flow

The application follows this request flow:
1. **src/index.ts** - Cloudflare Workers entry point, handles POST requests to `/mcp/app`
2. Extracts Bearer token from `Authorization` header (validates `stp-` prefix)
3. Creates MCP handler that processes JSON-RPC 2.0 requests
4. Routes to tool implementations based on method name

### Core Components

**src/index.ts**: Direct JSON-RPC implementation that handles MCP protocol methods:
- `initialize`: Protocol handshake
- `tools/list`: Lists available tools
- `prompts/list` & `prompts/get`: Provides screenshot-to-tasks prompt
- `tools/call`: Executes tool calls with extracted Bearer token

**src/server.ts**: Original MCP SDK-based server (legacy, not currently used in production)

**src/lib/api-client.ts**: Centralized HTTP client for Superthread API
- Base URL: `https://api.superthread.com/v1`
- Handles Bearer token authentication
- Throws `SuperthreadAPIError` on failures
- Singleton instance: `apiClient`

**src/lib/response-filters.ts**: Response optimization layer
- Removes heavy fields (timestamps, user objects, arrays, media)
- Provides specific filters: `filterUserAccount()`, `filterSpaces()`, `filterBoard()`
- Generic fallback: `filterGenericResponse()` strips heavy fields recursively
- Achieves 60-80% payload reduction

**src/lib/search.ts**: Fuzzy search utilities for finding boards/cards by title

### Tool Structure

Tools are organized in `src/tools/` by domain:
- **user.ts**: `get_my_account`, `get_team_members`
- **spaces.ts**: `get_spaces`, `get_space`
- **boards.ts**: `get_board`, `get_board_details`, `get_boards`, `create_board`, `update_board`
- **cards.ts**: `create_card`, `get_card`, `update_card`, `add_related_card`, `archive_card`, `get_cards_assigned_to_user`

Each tool file exports:
1. Zod schemas for request validation
2. Implementation functions that accept `(params, authToken)` and use `apiClient`
3. Response filtering to minimize token usage

### Type Definitions

**src/types/**: TypeScript interfaces for Superthread API entities
- **common.ts**: Shared types (BaseCard, Member, List, etc.)
- **user.ts**: User and team structures
- **projects.ts**: Space/project structures
- **boards.ts**: Board structures
- **cards.ts**: Card CRUD request/response types
- **search.ts**: Search utilities

## Important Patterns

### Authentication Flow
All requests require a Superthread Personal Access Token (PAT) in the format `Bearer stp-XXXX`. The token is:
1. Extracted from the `Authorization` header in `src/index.ts`
2. Validated for `stp-` prefix
3. Passed to tool functions
4. Used by `apiClient` to authenticate with Superthread API

### Response Optimization
The core value proposition is reduced token usage. When adding/modifying tools:
1. Use `response-filters.ts` functions to strip heavy fields
2. Keep only IDs and essential data needed for tool chaining
3. Remove: timestamps, user objects, arrays (members, attachments), media (base64)
4. Preserve: IDs, titles, relationships

### Core Workflow (Screenshot-to-Tasks)
Typical 4-step tool chain:
1. `get_my_account()` → Extract `team_id`
2. `get_spaces(team_id)` → Get `project_id` and available boards
3. `get_board_details(team_id, board_id)` → Get `list_id` for task placement
4. `create_card(...)` → Create tasks with proper hierarchy

## Configuration

**biome.json**: Code formatting and linting
- Indent width: 4 spaces
- Line width: 100 characters
- Strict rules for unused imports/variables
- All code must pass `biome check`

**wrangler.jsonc**: Cloudflare Workers deployment config
- Entry point: `src/index.ts`
- Compatibility flags: `nodejs_compat` enabled
- Environments: staging, production
- Observability: enabled with head sampling

**tsconfig.json**: TypeScript configuration
- Target: ES2021
- Module: ES2022 with Bundler resolution
- Strict mode enabled

## Security Boundaries

**Allowed Operations**:
- Read: All user workspace data
- Create: Cards and boards (with permissions)

**Excluded Operations**:
- Destructive operations (delete permanently)
- Member management
- Space creation
- Bulk operations without user confirmation

## Deployment Notes

- Production URL: `https://superthread.sorbet.studio/mcp/app`
- Zero logging or data retention on remote deployment
- Cloudflare auto-builds from `main` branch
- Local development uses Wrangler dev server on port 8787
