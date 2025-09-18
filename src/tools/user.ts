import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

// Schema for getting the current user's information. No input needed.
export const getMeSchema = z.object({});

// Schema for updating the current user's information. All fields are optional.
export const updateMeSchema = z.object({
	first_name: z.string().optional().describe("The user's first name."),
	last_name: z.string().optional().describe("The user's last name."),
	display_name: z.string().optional().describe("The user's display name."),
	profile_image: z
		.string()
		.url()
		.optional()
		.describe("URL for the user's profile image."),
	thumbnail_image: z
		.string()
		.url()
		.optional()
		.describe("URL for the user's thumbnail image."),
	color: z
		.string()
		.optional()
		.describe("A color associated with the user (e.g., 'red', '#FF0000')."),
	timezone_id: z
		.string()
		.optional()
		.describe("The user's timezone identifier (e.g., 'America/Los_Angeles')."),
	autodetect_timezone_id: z
		.boolean()
		.optional()
		.describe("Whether to automatically detect the user's timezone."),
	locale: z
		.string()
		.optional()
		.describe("The user's preferred locale (e.g., 'en')."),
	job_description: z
		.string()
		.optional()
		.describe("The user's job description."),
});

// Schema for getting team members. Requires a team_id.
export const getTeamMembersSchema = z.object({
	team_id: z
		.string()
		.describe(
			"The ID of the team to get members from. Use the get_me tool to find your team IDs.",
		),
});

/**
 * Fetches the current user's details.
 * @param _args - Empty object.
 * @param token - The authentication token.
 * @returns The user's information.
 */
export async function get_me(
	_args: z.infer<typeof getMeSchema>,
	token: string,
) {
	// The API docs specify /v1/users/{user_id}, but a "me" endpoint is standard for PAT-based auth.
	// The previous implementation used /users/me, which is a sensible convention.
	// Without a user_id, this is the only way to get the current user's data.
	const response = await apiClient.makeRequest("/users/me", token);
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(response, null, 2),
			},
		],
	};
}

/**
 * Updates the current user's details.
 * @param args - The fields to update.
 * @param token - The authentication token.
 * @returns The updated user's information.
 */
export async function update_me(
	args: z.infer<typeof updateMeSchema>,
	token: string,
) {
	const response = await apiClient.makeRequest("/users/me", token, {
		method: "PATCH",
		body: JSON.stringify(args),
	});
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(response, null, 2),
			},
		],
	};
}

/**
 * Fetches the members of a specific team.
 * @param args - Contains the team_id.
 * @param token - The authentication token.
 * @returns A list of team members.
 */
export async function get_team_members(
	args: z.infer<typeof getTeamMembersSchema>,
	token: string,
) {
	const { team_id } = args;
	const response = await apiClient.makeRequest(
		`/teams/${team_id}/members`,
		token,
	);
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(response, null, 2),
			},
		],
	};
}

/**
 * Registers all user-related tools with the MCP server.
 * @param server - The MCP server instance.
 * @param authToken - The authentication token to be used by the tools.
 */
export async function getUserFromToken(token: string) {
	const response = await apiClient.makeRequest("/users/me", token);
	return response;
}

export async function getUserTeams(user: any) {
	return user.teams || [];
}

export function registerUserTools(server: McpServer, authToken: string) {
	server.registerTool(
		"get_me",
		{
			title: "Get Current User",
			description:
				"Fetches the profile information for the currently authenticated user.",
			inputSchema: getMeSchema.shape,
		},
		(args) => get_me(args, authToken),
	);

	server.registerTool(
		"update_me",
		{
			title: "Update Current User",
			description:
				"Updates the profile information for the currently authenticated user.",
			inputSchema: updateMeSchema.shape,
		},
		(args) => update_me(args, authToken),
	);

	server.registerTool(
		"get_team_members",
		{
			title: "Get Team Members",
			description: "Fetches the list of members for a specified team.",
			inputSchema: getTeamMembersSchema.shape,
		},
		(args) => get_team_members(args, authToken),
	);
}
