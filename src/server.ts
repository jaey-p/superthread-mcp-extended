import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerUserTools } from "./tools/user.js";
import { registerCardTools } from "./tools/cards.js";
import { registerBoardTools } from "./tools/boards.js";
import { registerSpaceTools } from "./tools/spaces.js";

/**
 * Creates MCP server with Bearer token (used for JSON-RPC direct implementation)
 */
export function createMCPServer(authToken: string): McpServer {
	const server = new McpServer({
		name: "superthread-mcp",
		title: "Superthread",
		version: "1.0.0",
	});

	// Register essential MVP tools with the provided token
	registerUserTools(server, authToken);
	registerSpaceTools(server, authToken);
	registerBoardTools(server, authToken);
	registerCardTools(server, authToken);

	return server;
}
