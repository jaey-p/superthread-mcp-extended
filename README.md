# Superthread MCP Extended

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![MCP](https://img.shields.io/badge/Model_Context_Protocol-Compatible-blue?style=flat-square)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

### A tiny MCP server by Sorbet Studio


An enhanced Model Context Protocol (MCP) server that extends the [official Superthread MCP](https://api.superthread.com/mcp) with comprehensive CRUD operations and optimized workflows. _**Drop-in**_ replacement with significantly more functionality.

Chose cloudflare workers over vercel since this app is pretty much serverless functions, with no complex nodejs features being uses, just simple api request tranforms. Besides, I love cloudflare's free tier. 

Please help create an issue/PR if you wanna add more tools or improve the existing ones. 

README is a work in progress. Ideas and thoughts are scattered rn.

## Key Difference from the official MCP

- **8 essential tools** instead of basic ask/search functionality
- **Complete CRUD operations** for cards, boards, and spaces
- **60-80% smaller API responses** through intelligent filtering
- **Screenshot-to-tasks workflow** optimized for AI assistants
- **Role-based security** with safe operation boundaries

## Quick Start

Use our hosted version directly without setup, with zero logging or data retention:

```
https://superthread-mcp.sorbet.studio/mcp/app
```

Note: The Cloudflare worker for this, literally just builds this main branch and deploys it. If you find any security or privacy loop holes, please open an issue, and i'll fix it. 

The idea is to just create a perfect drop in replacement to the original, no other code should ideally run apart from transforming/filtering the api requests from superthread. So you wont have to create your own instance, but if you want to, you should! (Deploy to Cloudflare button coming soon.)

Here's the MCP setup guide from [api.superthread.com/mcp](https://api.superthread.com/mcp) .. just the domain swapped in.

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "superthread-extended": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "https://superthread-mcp.sorbet.studio/mcp/app",
        "--header",
        "Authorization:${ST_PAT}"
      ],
      "env": {
        "ST_PAT": "Bearer stp-XXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXX"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add \
  --transport http \
  --scope local \
  "superthread-extended" \
  "https://superthread-mcp.sorbet.studio/mcp/app" \
  --env ST_PAT="stp-XXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXX" \
  --header "Authorization: Bearer ${ST_PAT}"
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "superthread-extended": {
      "type": "http",
      "url": "https://superthread-mcp.sorbet.studio/mcp/app",
      "headers": {
        "Authorization": "Bearer stp-XXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXX"
      }
    }
  }
}
```

## Available Tools

### User Management

- `get_my_account` - Get team ID and user information
- `get_team_members` - List team members

### Workspace Navigation

- `get_spaces` - List all spaces/projects with project IDs
- `get_space` - Get detailed space information

### Board Management

- `get_board` - Search for boards by title
- `get_board_details` - Get board with lists for task creation
- `get_boards` - List boards with filtering options
- `create_board` - Create new boards (admin/owner only)
- `update_board` - Update board properties

### Task Management

- `create_card` - Create tasks from any input
- `get_card` - Get detailed task information
- `update_card` - Update task properties
- `get_cards_assigned_to_user` - Get user's assigned tasks
- `add_related_card` - Link related tasks
- `archive_card` - Archive completed tasks

## Core Workflow

A typical 4-step process for say, extracting tasks from a screenshot using claude:

1. **`get_my_account()`** → Extract team_id
2. **`get_spaces(team_id)`** → Get project_id and available boards
3. **`get_board_details(team_id, board_id)`** → Get list_id for task placement
4. **`create_card(...)`** → Create tasks with proper hierarchy

Again, as MCP servers go, you could let Claude (etc) figure the tool call chain.

## Architecture

### Response Optimization

- Intelligent field filtering removes 60-80% of unnecessary data
- Preserves essential IDs and relationships for tool chaining
- Maintains full API compatibility with reduced token usage

### Security Boundaries

- Read operations: Full access to user's workspace data
- Create operations: Cards and boards only (with permissions)
- Excluded: Destructive operations, member management, space creation

### Project Structure

```
src/
├── lib/
│   ├── api-client.ts         # Centralized Superthread API client
│   ├── response-filters.ts   # Response optimization
│   └── search.ts            # Search utilities
├── tools/
│   ├── user.ts              # User and team operations
│   ├── spaces.ts            # Workspace navigation
│   ├── boards.ts            # Board management
│   └── cards.ts             # Task operations
├── types/                   # TypeScript definitions
├── index.ts                 # Cloudflare Workers entry
└── server.ts                # MCP server configuration
```

## Self-Hosting

### Development

```bash
git clone <repository>
cd superthread-mcp-extended
bun install
bun run dev
```

### Deployment

```bash
# Deploy to Cloudflare Workers
bun run deploy
```

### Local Usage

```
http://localhost:8787/mcp/app
```

## Requirements

- Superthread Personal Access Token (PAT)
- Node.js 22+ or Bun runtime (for development)
- Network access to api.superthread.com

## Authentication

All requests require a valid Superthread Personal Access Token:

```
Authorization: Bearer stp-XXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXX
```

Tokens can be generated in your Superthread account settings.

---

**Note:** This is an unofficial extension and is not affiliated with Superthread. For the official basic MCP server, visit [api.superthread.com/mcp](https://api.superthread.com/mcp).


# Credit:

- Superthread for the original MCP server and fantastic API docs (ofc the platform as well haha)
- Cloudflare for the Workers platform
- [Unofficial-Superthread-MCP](https://github.com/tdwells90/Unofficial-Superthread-MCP) for the initial inspiration and some code snippets, and the idea of using ZOD for request validation. Really cool project, please check them out too as a direct local alternative to this one.