import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

// Schema for creating a list
export const createListSchema = z.object({
	team_id: z.string().describe("Team/workspace ID (from get_my_account tool)"),
	board_id: z.string().describe("Board ID where the list will be created"),
	title: z.string().describe("List title/name"),
	behavior: z
		.enum(["backlog", "active", "done", "custom"])
		.optional()
		.describe("List behavior type"),
	color: z.string().optional().describe("List color (hex code or color name)"),
	position: z
		.number()
		.optional()
		.describe("Position/order of the list in the board"),
});

// Schema for updating a list
export const updateListSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	list_id: z.string().describe("List ID to update"),
	title: z.string().optional().describe("Updated list title"),
	behavior: z
		.enum(["backlog", "active", "done", "custom"])
		.optional()
		.describe("Updated list behavior"),
	color: z.string().optional().describe("Updated list color"),
	position: z
		.number()
		.optional()
		.describe("Updated position/order in the board"),
});

/**
 * Creates a new list in a board.
 * @param args - Contains team_id, board_id, title, and optional behavior, color, and position.
 * @param token - The authentication token.
 * @returns The created list.
 */
export async function create_list(
	args: z.infer<typeof createListSchema>,
	token: string,
) {
	// TODO: Implement create_list API call
	// Should call: POST Create a list
	// API endpoint: `/${team_id}/boards/${board_id}/lists` with title, behavior, color, and position in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"create_list function is a placeholder and not yet implemented",
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
 * Updates an existing list.
 * @param args - Contains team_id, list_id, and optional title, behavior, color, and position.
 * @param token - The authentication token.
 * @returns The updated list.
 */
export async function update_list(
	args: z.infer<typeof updateListSchema>,
	token: string,
) {
	// TODO: Implement update_list API call
	// Should call: PATCH Update a list
	// API endpoint: `/${team_id}/lists/${list_id}` with title, behavior, color, and position in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"update_list function is a placeholder and not yet implemented",
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
 * Registers all list-related tools with the MCP server.
 * @param server - The MCP server instance.
 * @param authToken - The authentication token to be used by the tools.
 */
export function registerListTools(server: McpServer, authToken: string) {
	server.registerTool(
		"create_list",
		{
			title: "Create List",
			description:
				"Creates a new list in a board with title and optional behavior, color, and position.",
			inputSchema: createListSchema.shape,
		},
		(args) => create_list(args, authToken),
	);

	server.registerTool(
		"update_list",
		{
			title: "Update List",
			description:
				"Updates an existing list with new title, behavior, color, and/or position.",
			inputSchema: updateListSchema.shape,
		},
		(args) => update_list(args, authToken),
	);
}
