import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";
import { filterUserAccount } from "../lib/response-filters.js";

// Schema for getting the current user's information. No input needed.
export const getMyAccountSchema = z.object({});

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
export async function get_my_account(
	_args: z.infer<typeof getMyAccountSchema>,
	token: string,
) {
	// The API docs specify /v1/users/{user_id}, but a "me" endpoint is standard for PAT-based auth.
	// The previous implementation used /users/me, which is a sensible convention.
	// Without a user_id, this is the only way to get the current user's data.
	const response = await apiClient.makeRequest("/users/me", token);
	const filteredResponse = filterUserAccount(response);
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(filteredResponse, null, 2),
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
		"get_my_account",
		{
			title: "Get Current User",
			description:
				"Fetches the profile information for the currently authenticated user.",
			inputSchema: getMyAccountSchema.shape,
		},
		(args) => get_my_account(args, authToken),
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
