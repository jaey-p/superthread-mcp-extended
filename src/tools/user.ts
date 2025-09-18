import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";
import type { User } from "../types/user.js";

export const getMeSchema = {};

export const updateMeSchema = {
	first_name: z.string().optional().describe("First name"),
	last_name: z.string().optional().describe("Last name"),
	display_name: z.string().optional().describe("Display name"),
	profile_image: z.string().optional().describe("Profile image URL"),
	timezone_id: z.string().optional().describe("Timezone ID"),
	locale: z.string().optional().describe("Locale"),
};

export const getUserFromToken = async (token: string): Promise<User> => {
	return await apiClient.makeRequest("/users/me", token);
};

export async function getMe(args: any, token: string) {
	const startTime = Date.now();

	console.log(
		JSON.stringify({
			event: "tool_call_start",
			tool_name: "get_me",
			timestamp: new Date().toISOString(),
		}),
	);

	try {
		const user = await getUserFromToken(token);
		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_success",
				tool_name: "get_me",
				duration_ms,
				user_id: user?.user?.id,
				status: "success",
				timestamp: new Date().toISOString(),
			}),
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(user, null, 2),
				},
			],
		};
	} catch (error) {
		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_error",
				tool_name: "get_me",
				duration_ms,
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			}),
		);

		throw error;
	}
}

export async function getUserTeams(user: User): Promise<string[]> {
	return user?.user?.teams?.map((team: any) => team.id) || [];
}

export async function updateMe(args: any, token: string) {
	const startTime = Date.now();

	console.log(
		JSON.stringify({
			event: "tool_call_start",
			tool_name: "update_me",
			timestamp: new Date().toISOString(),
		}),
	);

	try {
		const typedArgs = args as z.infer<z.ZodObject<typeof updateMeSchema>>;
		const allowedFields = [
			"first_name",
			"last_name",
			"display_name",
			"profile_image",
			"timezone_id",
			"locale",
		];

		const updateData: Record<string, any> = {};
		for (const [key, value] of Object.entries(typedArgs)) {
			if (allowedFields.includes(key) && value !== undefined) {
				updateData[key] = value;
			}
		}

		const user = await apiClient.makeRequest("/users/me", token, {
			method: "PATCH",
			body: JSON.stringify(updateData),
		});

		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_success",
				tool_name: "update_me",
				duration_ms,
				user_id: user?.user?.id,
				status: "success",
				timestamp: new Date().toISOString(),
			}),
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(user, null, 2),
				},
			],
		};
	} catch (error) {
		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_error",
				tool_name: "update_me",
				duration_ms,
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			}),
		);

		throw error;
	}
}

export const getTeamMembersSchema = {
	team_id: z
		.string()
		.describe(
			"The ID of the team to get members from. Use the get_me tool to get the team IDs available.",
		),
};

export async function getTeamMembers(args: any, token: string) {
	const startTime = Date.now();

	console.log(
		JSON.stringify({
			event: "tool_call_start",
			tool_name: "get_team_members",
			timestamp: new Date().toISOString(),
		}),
	);

	try {
		const { team_id } = args as z.infer<
			z.ZodObject<typeof getTeamMembersSchema>
		>;
		const members = await apiClient.makeRequest(
			`/teams/${team_id}/members`,
			token,
		);

		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_success",
				tool_name: "get_team_members",
				duration_ms,
				team_id,
				status: "success",
				timestamp: new Date().toISOString(),
			}),
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(members, null, 2),
				},
			],
		};
	} catch (error) {
		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_error",
				tool_name: "get_team_members",
				duration_ms,
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			}),
		);

		throw error;
	}
}

export function registerUserTools(server: McpServer, authToken: string) {
	server.registerTool(
		"get_me",
		{
			title: "Fetch the current user Information",
			description:
				"Fetches detailed information about the current user, including profile details, teams, locale, and other metadata",
			inputSchema: {},
		},
		(args) => getMe(args, authToken),
	);

	server.registerTool(
		"update_me",
		{
			title: "Update User Information",
			description:
				"Updates the current user profile fields such as name, profile image, timezone, and company information",
			inputSchema: updateMeSchema,
		},
		(args) => updateMe(args, authToken),
	);
}
