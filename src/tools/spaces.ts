import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";
import { filterSpaces } from "../lib/response-filters.js";

// Schema for creating a space
export const createSpaceSchema = z.object({
	team_id: z.string().describe("Team/workspace ID (from get_my_account tool)"),
	name: z.string().describe("Space name"),
	description: z.string().optional().describe("Space description"),
	privacy: z
		.enum(["public", "private"])
		.optional()
		.describe("Space privacy setting"),
});

// Schema for updating a space
export const updateSpaceSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	space_id: z.string().describe("Space ID to update"),
	name: z.string().optional().describe("Updated space name"),
	description: z.string().optional().describe("Updated space description"),
	privacy: z
		.enum(["public", "private"])
		.optional()
		.describe("Updated privacy setting"),
});

// Schema for getting a space
export const getSpaceSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	space_id: z.string().describe("Space ID to retrieve"),
});

// Schema for getting spaces
export const getSpacesSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	cursor: z
		.string()
		.optional()
		.describe("Pagination cursor for large result sets"),
});

// Schema for adding member to space
export const addMemberToSpaceSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	space_id: z.string().describe("Space ID to add member to"),
	user_id: z.string().describe("User ID to add to the space"),
	role: z
		.enum(["admin", "member", "viewer"])
		.optional()
		.describe("Member role in the space"),
});

/**
 * Creates a new space.
 * @param args - Contains team_id, name, and optional description and privacy.
 * @param token - The authentication token.
 * @returns The created space.
 */
export async function create_space(
	args: z.infer<typeof createSpaceSchema>,
	token: string,
) {
	// TODO: Implement create_space API call
	// Should call: POST Create a space
	// API endpoint: `/${team_id}/projects` with name, description, and privacy in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"create_space function is a placeholder and not yet implemented",
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
 * Updates an existing space.
 * @param args - Contains team_id, space_id, and optional name, description, and privacy.
 * @param token - The authentication token.
 * @returns The updated space.
 */
export async function update_space(
	args: z.infer<typeof updateSpaceSchema>,
	token: string,
) {
	// TODO: Implement update_space API call
	// Should call: PATCH Update a space
	// API endpoint: `/${team_id}/projects/${space_id}` with name, description, and privacy in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"update_space function is a placeholder and not yet implemented",
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
 * Gets a specific space by ID.
 * @param args - Contains team_id and space_id.
 * @param token - The authentication token.
 * @returns The space details.
 */
export async function get_space(
	args: z.infer<typeof getSpaceSchema>,
	token: string,
) {
	try {
		const { team_id, space_id } = args;
		const response = (await apiClient.makeRequest(
			`/${team_id}/projects/${space_id}`,
			token,
		)) as any;

		// Apply basic filtering to reduce response size
		const filteredResponse = {
			id: response.id,
			title: response.title || response.name,
			description: response.description,
			boards: (response.boards || []).map((board: any) => ({
				id: board.id,
				title: board.title || board.name,
			})),
		};

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(filteredResponse, null, 2),
				},
			],
		};
	} catch (error) {
		console.error("Error getting space:", error);
		throw new Error(`Failed to get space ${args.space_id}: ${error}`);
	}
}

/**
 * Gets all spaces for a team.
 * @param args - Contains team_id and optional cursor.
 * @param token - The authentication token.
 * @returns A list of spaces.
 */
export async function get_spaces(
	args: z.infer<typeof getSpacesSchema>,
	token: string,
) {
	try {
		const { team_id, cursor } = args;
		const queryParams = cursor ? `?cursor=${cursor}` : "";
		const spaces = await apiClient.makeRequest(
			`/${team_id}/projects${queryParams}`,
			token,
		);
		const filteredSpaces = filterSpaces(spaces);
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(filteredSpaces, null, 2),
				},
			],
		};
	} catch (error) {
		console.error("Error getting spaces:", error);
		throw new Error("Failed to get spaces.");
	}
}

/**
 * Adds a member to an existing space.
 * @param args - Contains team_id, space_id, user_id, and optional role.
 * @param token - The authentication token.
 * @returns The member addition status.
 */
export async function add_member_to_space(
	args: z.infer<typeof addMemberToSpaceSchema>,
	token: string,
) {
	// TODO: Implement add_member_to_space API call
	// Should call: POST Add a member to a space
	// API endpoint: `/${team_id}/projects/${space_id}/members` with user_id and role in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"add_member_to_space function is a placeholder and not yet implemented",
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
 * Registers all space-related tools with the MCP server.
 * @param server - The MCP server instance.
 * @param authToken - The authentication token to be used by the tools.
 */
export function registerSpaceTools(server: McpServer, authToken: string) {
	server.registerTool(
		"create_space",
		{
			title: "Create Space",
			description:
				"Creates a new space with name and optional description and privacy.",
			inputSchema: createSpaceSchema.shape,
		},
		(args) => create_space(args, authToken),
	);

	server.registerTool(
		"update_space",
		{
			title: "Update Space",
			description:
				"Updates an existing space with new name, description, and/or privacy.",
			inputSchema: updateSpaceSchema.shape,
		},
		(args) => update_space(args, authToken),
	);

	server.registerTool(
		"get_space",
		{
			title: "Get Space Details",
			description:
				"Gets detailed information about a specific space/project by ID. Use this to view project details and contained boards.",
			inputSchema: getSpaceSchema.shape,
		},
		(args) => get_space(args, authToken),
	);

	server.registerTool(
		"get_spaces",
		{
			title: "Get Spaces",
			description:
				"Gets all spaces/projects for a team. Returns project IDs needed for board and card creation.",
			inputSchema: getSpacesSchema.shape,
		},
		(args) => get_spaces(args, authToken),
	);

	server.registerTool(
		"add_member_to_space",
		{
			title: "Add Member to Space",
			description: "Adds a member to an existing space with optional role.",
			inputSchema: addMemberToSpaceSchema.shape,
		},
		(args) => add_member_to_space(args, authToken),
	);
}
