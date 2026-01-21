import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

export const getTagsSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	project_id: z
		.string()
		.optional()
		.describe("Project ID to filter tags (optional)"),
});

export const createTagSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	name: z.string().describe("Tag name"),
	color: z
		.string()
		.optional()
		.describe("Tag color in hex format (e.g., #667085)"),
	project_id: z
		.string()
		.optional()
		.describe("Project ID to associate the tag with (optional)"),
});

/**
 * Gets tags for a team, optionally filtered by project
 */
export async function get_tags(
	args: z.infer<typeof getTagsSchema>,
	token: string,
) {
	const { team_id, project_id } = args;
	const queryParams = project_id ? `?project_id=${project_id}` : "";
	return apiClient.makeRequest(`/${team_id}/tags${queryParams}`, token);
}

/**
 * Creates a new tag
 */
export async function create_tag(
	args: z.infer<typeof createTagSchema>,
	token: string,
) {
	const { team_id, ...payload } = args;

	// Remove undefined values from payload
	const cleanPayload: any = Object.fromEntries(
		Object.entries(payload).filter(([_, value]) => value !== undefined),
	);

	return apiClient.makeRequest(`/${team_id}/tags`, token, {
		method: "POST",
		body: JSON.stringify(cleanPayload),
	});
}

/**
 * Registers all tag-related tools with the MCP server
 */
export function registerTagTools(server: McpServer, authToken: string) {
	server.registerTool(
		"get_tags",
		{
			title: "Get Tags",
			description:
				"Gets all tags for a team, optionally filtered by project ID",
			inputSchema: getTagsSchema.shape,
		},
		async (args) => {
			const result = await get_tags(args, authToken);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		},
	);

	server.registerTool(
		"create_tag",
		{
			title: "Create Tag",
			description: "Creates a new tag with name, color, and optional project",
			inputSchema: createTagSchema.shape,
		},
		async (args) => {
			const result = await create_tag(args, authToken);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		},
	);
}

