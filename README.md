# Superthread MCP Server

An unofficial Model Context Protocol (MCP) server for integrating with the [Superthread](https://superthread.com) API. This server provides comprehensive tools for managing users, cards, projects, boards, and all workspace content through Claude and other MCP-compatible clients.

## 🛠️ Available MCP Tools

The Superthread MCP Server provides **41 tools** across **11 functional categories**, with **22 fully implemented tools** covering core project management functionality.

## 🟢 **WORKING TOOLS** (22 tools across 4 categories)

### **1. User Tools** (`src/tools/user.ts`) - ✅ IMPLEMENTED

- `get_my_account` - Get current user profile information
- `get_team_members` - Get members of a specific team

### **2. Card Tools** (`src/tools/cards.ts`) - ✅ IMPLEMENTED

- `create_card` - Create new cards with full metadata support
- `get_card` - Get specific card by ID
- `update_card` - Update card properties (title, lists, owners, dates, etc.)
- `get_cards_assigned_to_user` - Get cards assigned to specific user
- `add_related_card` - Create relationships between cards (blocks/relates to)
- `archive_card` - Archive cards

### **3. Project Tools** (`src/tools/projects.ts`) - ✅ IMPLEMENTED

- `list_projects` - List all projects (epics) in a team
- `get_project` - Get specific project by ID
- `create_project` - Create new projects
- `update_project` - Update project properties
- `get_projects` - Get projects with pagination
- `add_related_card_to_project` - Link cards to projects
- `archive_project` - Archive projects

### **4. Board Tools** (`src/tools/boards.ts`) - ✅ IMPLEMENTED

- `create_board` - Create boards (with admin/owner role validation)
- `update_board` - Update board properties
- `get_boards` - List boards with filtering options
- `get_board` - Search and get boards by title/ID

---

## 🟡 **PARTIALLY IMPLEMENTED** (1 category)

### **5. Space Tools** (`src/tools/spaces.ts`) - 🔄 MIXED STATUS

- `get_spaces` - ✅ **WORKING** (recently implemented)
- `create_space` - ❌ Stub
- `update_space` - ❌ Stub
- `get_space` - ❌ Stub
- `add_member_to_space` - ❌ Stub

---

## 🔴 **STUB TOOLS** (17 tools across 6 categories)

### **6. Tag Tools** (`src/tools/tags.ts`) - ❌ STUB

- `get_tags` - Get tags for team/project
- `add_tags_to_card` - Add tags to cards

### **7. Comment Tools** (`src/tools/comments.ts`) - ❌ STUB

- `create_comment` - Create comments on cards/pages
- `edit_comment` - Edit existing comments
- `get_comment` - Get specific comment
- `get_all_replies_to_comment` - Get comment replies
- `reply_to_comment` - Reply to comments
- `edit_reply` - Edit comment replies

### **8. Note Tools** (`src/tools/notes.ts`) - ❌ STUB

- `create_note` - Create notes
- `get_note` - Get specific note
- `get_notes` - List notes with filtering

### **9. Page Tools** (`src/tools/pages.ts`) - ❌ STUB

- `create_page` - Create wiki-style pages
- `update_page` - Update page content
- `get_page` - Get specific page
- `get_pages` - List pages with filtering
- `archive_page` - Archive pages

### **10. List Tools** (`src/tools/lists.ts`) - ❌ STUB

- `create_list` - Create lists in boards
- `update_list` - Update list properties

### **11. Search Tools** (`src/tools/search.ts`) - ❌ STUB

- `get_search_results` - Search across all content types

---

## 🚀 **SPECIAL FEATURES**

### **MCP Prompts** (`src/index.ts`) - 🔄 CURRENTLY IMPLEMENTING

- `prompts/list` - List available workflow prompts
- `prompts/get` - Get specific prompt templates

---

## 📊 **SUMMARY STATISTICS**

| Status         | Count           | Categories        | Percentage |
| -------------- | --------------- | ----------------- | ---------- |
| ✅ **Working** | 22 tools        | 4 categories      | **56%**    |
| 🔄 **Mixed**   | 5 tools         | 1 category        | **13%**    |
| ❌ **Stub**    | 17 tools        | 6 categories      | **44%**    |
| 🚀 **Special** | 2 features      | MCP Prompts       | -          |
| **TOTAL**      | **41 features** | **11 categories** | **100%**   |

## 🎯 **IMPLEMENTATION PRIORITY**

**Tier 1 (Core)**: ✅ Complete

- User management, Cards, Projects, Boards

**Tier 2 (Enhanced)**: 🔄 In Progress

- Spaces (1/5 implemented), MCP Prompts

**Tier 3 (Secondary)**: ❌ Future

- Comments, Notes, Pages, Lists, Tags, Search

The server has **strong coverage of core Superthread functionality** but placeholder implementations for secondary features. The working tools provide comprehensive project management capabilities.

## 📋 **Common Workflows**

### **Getting Started:**

1. `get_my_account` → Get available teams and your permissions
2. `get_projects` → See available projects/workspaces
3. `get_boards` → List boards with filtering (requires project_id, bookmarked, or archived)

### **Creating a New Workspace:**

1. `get_my_account` → Get team_id for workspace creation
2. `create_project` → Create project/epic container
3. `create_board` → Create kanban board in project
4. `create_card` → Add initial tasks/issues

### **Managing Daily Work:**

1. `get_cards_assigned_to_user` → See your assigned tasks
2. `update_card` → Update progress, status, or details
3. `add_related_card` → Link dependencies (blocks/blocked_by/relates_to)
4. `archive_card` → Archive completed tasks

### **Team Collaboration:**

1. `get_team_members` → See team structure and roles
2. `get_spaces` → List available team spaces
3. `add_related_card_to_project` → Organize work within projects

## 🛡️ **Security & Safety**

### **Intentionally Excluded Operations**

For data safety and preventing accidental data loss, these destructive operations are intentionally not implemented:

- Permanent deletion of any content (cards, boards, projects)
- Team member removal from teams/spaces
- User privilege escalation
- Destructive duplicate operations

### **Role-Based Access Control**

- `create_board` requires admin/owner role validation
- All operations respect team membership and permissions
- Authentication required via Superthread Personal Access Token

## 🚀 **Development**

### **Commands**

- `bun run dev` / `bun start` - Start local development server
- `bun run build` - Build for production using esbuild
- `bun run format` - Format code with Biome
- `bun run lint:fix` - Lint and auto-fix issues
- `bun run type-check` - Run TypeScript type checking
- `bun test` - Run health check (requires server running)
- `bun run deploy` - Deploy to Cloudflare Workers

### **Code Style**

- **Formatting**: 4-space indentation, 100-character line width (Biome configured)
- **TypeScript**: Strict mode enabled, target ES2021, module ES2022
- **Imports**: Use `.js` extensions for local imports, explicit type imports with `import type`
- **Validation**: Use Zod schemas for input validation, export schemas with descriptive names
- **Naming**: camelCase for functions/variables, PascalCase for classes/types, snake_case for API endpoints
- **Error Handling**: Custom error classes (e.g., `SuperthreadAPIError`), descriptive error messages
- **Structure**: Organize by feature (`tools/`, `types/`, `lib/`), register tools in `server.ts`
- **MCP Tools**: Export tool functions and registration functions separately, include detailed descriptions
- **API Client**: Use centralized `apiClient` from `lib/api-client.ts`, include proper auth token handling

### **Project Structure**

```
src/
├── lib/           # Core utilities (API client, search)
├── tools/         # MCP tool implementations
├── types/         # TypeScript type definitions
├── index.ts       # JSON-RPC direct implementation
└── server.ts      # MCP server setup
```

## 🐳 **Docker Support**

A Dockerfile is included for containerized deployment:

```bash
docker build -t superthread-mcp .
docker run -p 3000:3000 superthread-mcp
```

## 🔌 **MCP Client Integration**

To use this server with Claude or another MCP client, configure it to connect to:

```
http://localhost:3000/mcp
```

Include your Superthread Personal Access Token in the Authorization header:

```
Authorization: Bearer YOUR_SUPERTHREAD_TOKEN
```

## ⚙️ **Requirements**

- Node.js 22+ or Bun runtime
- Superthread Personal Access Token
- Network access to api.superthread.com

## 📄 **License**

This is an unofficial integration and is not affiliated with Superthread.
