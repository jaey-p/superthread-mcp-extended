# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` or `npm start` - Start local development server with Wrangler
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run format` - Format code with Biome
- `npm run lint:fix` - Lint and auto-fix issues with Biome  
- `npm run type-check` - Run TypeScript type checking
- `npm run cf-typegen` - Generate Cloudflare Worker types

## Architecture Overview

This is a **Remote MCP Server** built on **Cloudflare Workers** that demonstrates OAuth authentication with MCP (Model Context Protocol) integration.

### Core Components

- **`src/index.ts`** - Main entry point that exports an OAuthProvider with MCP server integration
- **`src/app.ts`** - Hono-based web application handling OAuth authorization flow (`/`, `/authorize`, `/approve`)
- **`src/utils.ts`** - HTML rendering utilities for OAuth UI components and markdown content
- **`MyMCP` class** - Extends McpAgent to provide MCP tools (currently implements a simple "add" tool)

### Key Technologies

- **Cloudflare Workers** - Runtime environment with Durable Objects for MCP state
- **Hono** - Web framework for HTTP routing and middleware
- **MCP SDK** - Model Context Protocol implementation for tool registration
- **OAuth Provider** - Cloudflare's OAuth implementation for authentication
- **Biome** - Code formatting and linting (not ESLint/Prettier)
- **TypeScript** - With strict mode enabled

### Configuration

- **Durable Objects** - `MyMCP` class bound as `MCP_OBJECT`
- **KV Storage** - `OAUTH_KV` namespace (requires manual setup: `npx wrangler kv namespace create OAUTH_KV`)
- **Static Assets** - Served from `./static/` directory, bound as `ASSETS`

### Local Development Setup

1. Clone and install: `git clone` → `pnpm install` (note: uses pnpm, not npm)
2. Start dev server: `npm run dev` 
3. Access at `http://localhost:8787/`
4. Test MCP with inspector: `npx @modelcontextprotocol/inspector` → SSE transport → `http://localhost:8787/sse`

### Deployment Requirements

Before deployment, update `wrangler.jsonc`:
- Add your KV namespace ID to replace `<ADD YOUR KV NAMESPACEID HERE>`
- Run `npm run deploy`

### MCP Integration

The server exposes MCP tools at `/sse` endpoint using Server-Sent Events transport. OAuth flow protects access with configurable scopes (read_profile, read_data, write_data). Demo accepts any email/password for authentication.