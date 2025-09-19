import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

// Schema for getting search results
export const getSearchResultsSchema = z.object({
	team_id: z.string().describe("Team/workspace ID (from get_my_account tool)"),
	query: z.string().describe("Search query string"),
	type: z
		.enum(["cards", "projects", "notes", "pages", "all"])
		.optional()
		.describe("Filter results by content type"),
	project_id: z
		.string()
		.optional()
		.describe("Filter results to specific project/space"),
	limit: z.number().optional().describe("Maximum number of results to return"),
	cursor: z
		.string()
		.optional()
		.describe("Pagination cursor for large result sets"),
});

/**
 * Gets search results across different content types in Superthread.
 * @param args - Contains team_id, query, and optional type, project_id, limit, and cursor.
 * @param token - The authentication token.
 * @returns Search results matching the query.
 */
export async function get_search_results(
	args: z.infer<typeof getSearchResultsSchema>,
	token: string,
) {
	// TODO: Implement get_search_results API call
	// Should call: GET Get search results
	// API endpoint: `/${team_id}/search` with query, type, project_id, limit, and cursor as query parameters

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"get_search_results function is a placeholder and not yet implemented",
						requested_args: args,
					},
					null,
					2,
				),
			},
		],
	};
}

/**
 * Registers all search-related tools with the MCP server.
 * @param server - The MCP server instance.
 * @param authToken - The authentication token to be used by the tools.
 */
export function registerSearchTools(server: McpServer, authToken: string) {
	server.registerTool(
		"get_search_results",
		{
			title: "Get Search Results",
			description:
				"Searches across different content types (cards, projects, notes, pages) in Superthread with optional filtering.",
			inputSchema: getSearchResultsSchema.shape,
		},
		(args) => get_search_results(args, authToken),
	);
}
