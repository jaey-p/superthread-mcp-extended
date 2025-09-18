import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerUserTools } from "./tools/user.js";
import { registerCardTools } from "./tools/cards.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerBoardTools } from "./tools/boards.js";
import { registerTagTools } from "./tools/tags.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerNoteTools } from "./tools/notes.js";
import { registerPageTools } from "./tools/pages.js";
import { registerSpaceTools } from "./tools/spaces.js";
import { registerListTools } from "./tools/lists.js";
import { registerSearchTools } from "./tools/search.js";

/**
 * Creates MCP server with Bearer token (used for JSON-RPC direct implementation)
 */
export function createMCPServer(authToken: string): McpServer {
	const server = new McpServer({
		name: "superthread-mcp",
		title: "Superthread",
		version: "1.0.0",
	});

	// Register all tools with the provided token
	registerUserTools(server, authToken);
	registerCardTools(server, authToken);
	registerProjectTools(server, authToken);
	registerBoardTools(server, authToken);
	registerTagTools(server, authToken);
	registerCommentTools(server, authToken);
	registerNoteTools(server, authToken);
	registerPageTools(server, authToken);
	registerSpaceTools(server, authToken);
	registerListTools(server, authToken);
	registerSearchTools(server, authToken);

	return server;
}
