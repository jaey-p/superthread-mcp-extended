# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm run dev` or `npm start` - Start local development server with Wrangler
- `pnpm run deploy` - Deploy to Cloudflare Workers
- `pnpm run format` - Format code with Biome
- `pnpm run lint:fix` - Lint and auto-fix issues with Biome
- `pnpm run type-check` - Run TypeScript type checking
- `pnpm run cf-typegen` - Generate Cloudflare Worker types
- `pnpm run build` - Build for production using esbuild
- `pnpm run test` - Run health check test (requires server to be running)

## Architecture Overview

This is a **Superthread MCP Server** built on **Cloudflare Workers** that provides Model Context Protocol (MCP) tools for integrating with the [Superthread](https://superthread.com) API. It allows Claude and other MCP clients to manage users, cards, projects, and boards in Superthread through OAuth-protected API access.

### Core Components

- **`src/index.ts`** - Main entry point that sets up OAuthProvider with MCP server integration and handles SUPERTHREAD_PAT secret
- **`src/server.ts`** - Creates and configures the MCP server, registers all tool categories
- **`src/tools/`** - MCP tool implementations organized by category:
  - `user.ts` - User management (get_me, update_me)
  - `cards.ts` - Card management (create, get, update, delete)
  - `projects.ts` - Project management (get_project)
  - `boards.ts` - Board management (create, get, list, update, delete)
- **`src/lib/`** - Core utilities:
  - `api-client.ts` - Superthread API client
  - `search.ts` - Search utilities
- **`src/types/`** - TypeScript type definitions for all Superthread entities

### Key Technologies

- **Cloudflare Workers** - Runtime environment with KV storage
- **Hono** - Web framework for HTTP routing and middleware
- **MCP SDK** - Model Context Protocol implementation for tool registration
- **OAuth Provider** - Cloudflare's OAuth implementation for authentication
- **Biome** - Code formatting and linting (configured with 4-space indentation, 100-char line width)
- **TypeScript** - With strict mode enabled
- **Superthread API** - External API integration for workspace management

### Configuration

- **KV Storage** - Two namespaces:
  - `OAUTH_KV` (requires manual setup: `npx wrangler kv namespace create OAUTH_KV`)
  - `superthread` (pre-configured with ID)
- **Secrets** - `SUPERTHREAD_PAT` (Personal Access Token for Superthread API)
- **Static Assets** - Served from `./static/` directory, bound as `ASSETS`
- **Node.js Compatibility** - Enabled for Workers runtime

### Local Development Setup

1. Install dependencies: `npm install` (note: package.json uses npm, not pnpm)
2. Set up KV namespace: `npx wrangler kv namespace create OAUTH_KV` and update `wrangler.jsonc`
3. Configure Superthread PAT: `npx wrangler secret put SUPERTHREAD_PAT`
4. Start dev server: `npm run dev`
5. Access at `http://localhost:8787/`
6. Test MCP with inspector: `npx @modelcontextprotocol/inspector` → SSE transport → `http://localhost:8787/sse`

### Deployment Requirements

Before deployment, ensure `wrangler.jsonc` is properly configured:

- Update OAUTH_KV namespace ID (replace `<ADD YOUR KV NAMESPACEID HERE>`)
- Ensure SUPERTHREAD_PAT secret is set
- Run `npm run deploy`

### MCP Integration

The server exposes MCP tools at `/sse` endpoint using Server-Sent Events transport. OAuth flow protects access with configurable scopes (read_profile, read_data, write_data). The demo accepts any email/password for authentication.

**Available Tool Categories:**

- **User Management** - Get and update user profile information
- **Card Management** - Full CRUD operations for Superthread cards
- **Project Management** - Read access to projects
- **Board Management** - Full CRUD operations for boards

### Development Notes

- The project structure follows a clean separation between MCP tools (`src/tools/`), API utilities (`src/lib/`), and type definitions (`src/types/`)
- All tools require authentication via Superthread Personal Access Token
- The OAuth flow is integrated with MCP for secure API access
- Biome is configured with specific formatting rules (4-space indents, 100-character lines)
