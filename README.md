# Superthread MCP Server

An unofficial Model Context Protocol (MCP) server for integrating with the [Superthread](https://superthread.com) API. This server provides comprehensive tools for managing users, cards, projects, boards, and all workspace content through Claude and other MCP-compatible clients.

## 🛠️ Available MCP Tools

The Superthread MCP Server provides **50 tools** across **11 functional categories**, offering comprehensive workspace management capabilities.

### ✅ **User Management (4 tools)**

**Authentication & Team Access:**

- `get_my_account` - Get current user details and team memberships
- `update_my_account` - Update user profile information (name, display name, timezone, etc.)
- `get_team_members` - List team members and their roles
- `update_team_member` - Update team member roles and permissions

### ✅ **Card Management (8 tools)**

**Task & Issue Tracking:**

- `create_card` - Create new cards with full metadata (title, owner, priority, estimates, dates)
- `get_card` - Retrieve detailed card information by ID
- `update_card` - Modify existing card properties (title, status, assignee, dates, etc.)
- `delete_card` - Permanently delete a card
- `duplicate_card` - Clone existing cards with optional title override
- `get_cards_assigned_to_user` - Get user's assigned cards with optional project filtering
- `add_related_card` - Link related cards (blocks, blocked_by, relates_to relationships)
- `archive_card` - Archive cards (non-destructive alternative to deletion)

### ✅ **Board Management (6 tools)**

**Kanban & Project Boards:**

- `create_board` - Create new boards in teams/projects
- `get_board` - Get board details with lists and cards
- `get_boards` - List boards with filtering options (requires project_id, bookmarked, or archived filter)
- `update_board` - Modify board properties (title, description, settings)
- `delete_board` - Permanently delete a board
- `duplicate_board` - Clone existing boards with optional customization

### ✅ **Project Management (7 tools)**

**Spaces & Epic Organization:**

- `list_projects` - List available projects with basic information
- `get_project` - Get detailed project information including cards and metadata
- `create_project` - Create new projects/epics with full configuration
- `update_project` - Modify project properties (title, description, status, etc.)
- `get_projects` - List projects with pagination support
- `add_related_card_to_project` - Link cards to projects for organization
- `archive_project` - Archive projects (non-destructive)

### ✅ **List Management (2 tools)**

**Board Columns & Workflow:**

- `create_list` - Create new lists in boards (columns/statuses for workflow)
- `update_list` - Modify list properties and positioning

### ✅ **Tag Management (2 tools)**

**Organization & Categorization:**

- `get_tags` - List available tags in team/project for organization
- `add_tags_to_card` - Apply tags to cards for categorization and filtering

### ✅ **Content Management (9 tools)**

**Documentation & Knowledge Base:**

**Notes (3 tools):**

- `create_note` - Create team notes for documentation
- `get_note` - Retrieve note details and content
- `get_notes` - List available notes with filtering options

**Pages (6 tools):**

- `create_page` - Create team pages/documentation with rich content
- `update_page` - Modify page content and metadata
- `get_page` - Retrieve page details and content
- `duplicate_page` - Clone existing pages
- `get_pages` - List available pages with filtering
- `archive_page` - Archive pages (non-destructive)

### ✅ **Comment Management (6 tools)**

**Collaboration & Communication:**

- `create_comment` - Add comments to cards/pages for collaboration
- `edit_comment` - Modify existing comment content
- `get_comment` - Retrieve comment details and metadata
- `get_all_replies_to_comment` - Get complete comment thread/replies
- `reply_to_comment` - Reply to existing comments for discussions
- `edit_reply` - Modify reply content

### ✅ **Space Management (5 tools)**

**Team Organization:**

- `create_space` - Create team spaces for organizing work
- `update_space` - Modify space properties and settings
- `get_space` - Get space details and configuration
- `get_spaces` - List available spaces with filtering
- `add_member_to_space` - Add team members to spaces

### ✅ **Search (1 tool)**

**Content Discovery:**

- `get_search_results` - Search across all content types (cards, projects, notes, pages, boards)

### 🚫 **Intentionally Excluded (Safety)**

For data safety and preventing accidental data loss, these destructive operations are intentionally not implemented:

- Team member removal from teams/spaces
- Permanent deletion of notes, pages, comments, or replies
- Tag removal or deletion
- Space deletion and forced member removal

## 📋 **Common Workflows**

### **Getting Started:**

1. `get_my_account` → Get available teams and your permissions
2. `get_projects` → See available projects/workspaces
3. `get_boards` → List boards with filtering (requires project_id, bookmarked, or archived)

### **Creating a New Workspace:**

1. `get_my_account` → Get team_id for workspace creation
2. `create_project` → Create project/epic container
3. `create_board` → Create kanban board in project
4. `create_list` → Add workflow columns (To Do, In Progress, Done)
5. `create_card` → Add initial tasks/issues

### **Managing Daily Work:**

1. `get_cards_assigned_to_user` → See your assigned tasks
2. `update_card` → Update progress, status, or details
3. `add_tags_to_card` → Organize and categorize work
4. `create_comment` → Collaborate and communicate progress
5. `add_related_card` → Link dependencies (blocks/blocked_by/relates_to)

### **Content & Documentation:**

1. `create_page` → Create team documentation
2. `create_note` → Add quick team notes
3. `get_search_results` → Find existing content across all types
4. `duplicate_page` → Clone templates for consistency

### **Team Collaboration:**

1. `get_team_members` → See team structure and roles
2. `create_space` → Organize team areas
3. `add_member_to_space` → Grant access to specific areas
4. `create_comment` / `reply_to_comment` → Facilitate discussions

### MCP Client Integration

To use this server with Claude or another MCP client, configure it to connect to:

```
http://localhost:3000/mcp
```

Include your Superthread Personal Access Token in the Authorization header:

```
Authorization: Bearer YOUR_SUPERTHREAD_TOKEN
```

## Development

### Scripts

- `bun run dev` - Run in development mode
- `bun run build` - Build for production
- `bun run start` - Build and run
- `bun run test` - Run health check test

### Project Structure

```
src/
├── lib/           # Core utilities (API client, search)
├── tools/         # MCP tool implementations
├── types/         # TypeScript type definitions
└── server.ts      # MCP server setup
```

## Docker Support

A Dockerfile is included for containerized deployment:

```bash
docker build -t superthread-mcp .
docker run -p 3000:3000 superthread-mcp
```

## Requirements

- Node.js 22+ or Bun runtime
- Superthread Personal Access Token
- Network access to api.superthread.com

## License

This is an unofficial integration and is not affiliated with Superthread.
