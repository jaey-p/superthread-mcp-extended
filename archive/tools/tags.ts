import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

// Schema for getting tags
export const getTagsSchema = z.object({
	team_id: z.string().describe("Team/workspace ID (from get_my_account tool)"),
	project_id: z.string().optional().describe("Filter tags by project ID"),
});

// Schema for adding tags to a card
export const addTagsToCardSchema = z.object({
	team_id: z.string().describe("Team/workspace ID (from get_my_account tool)"),
	card_id: z.string().describe("Card ID to add tags to"),
	tag_ids: z.array(z.string()).describe("Array of tag IDs to add to the card"),
});

/**
 * Fetches tags for a team, optionally filtered by project.
 * @param args - Contains team_id and optional project_id.
 * @param token - The authentication token.
 * @returns A list of tags.
 */
export async function get_tags(
	args: z.infer<typeof getTagsSchema>,
	token: string,
) {
	// TODO: Implement get_tags API call
	// Should call: GET /{team_id}/tags
	// API endpoint: `/${team_id}/tags` with optional project_id query parameter

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"get_tags function is a placeholder and not yet implemented",
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
 * Adds tags to a specific card.
 * @param args - Contains team_id, card_id, and tag_ids.
 * @param token - The authentication token.
 * @returns The result of adding tags to the card.
 */
export async function add_tags_to_card(
	args: z.infer<typeof addTagsToCardSchema>,
	token: string,
) {
	// TODO: Implement add_tags_to_card API call
	// Should call: POST /{team_id}/cards/{card_id}/tags
	// API endpoint: `/${team_id}/cards/${card_id}/tags` with tag_ids in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"add_tags_to_card function is a placeholder and not yet implemented",
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
 * Registers all tag-related tools with the MCP server.
 * @param server - The MCP server instance.
 * @param authToken - The authentication token to be used by the tools.
 */
export function registerTagTools(server: McpServer, authToken: string) {
	server.registerTool(
		"get_tags",
		{
			title: "Get Tags",
			description:
				"Fetches all tags for a team, optionally filtered by project.",
			inputSchema: getTagsSchema.shape,
		},
		(args) => get_tags(args, authToken),
	);

	server.registerTool(
		"add_tags_to_card",
		{
			title: "Add Tags to Card",
			description: "Adds one or more tags to a specific card.",
			inputSchema: addTagsToCardSchema.shape,
		},
		(args) => add_tags_to_card(args, authToken),
	);
}
