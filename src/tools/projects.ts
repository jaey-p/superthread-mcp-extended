import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

export const listProjectsSchema = {
	team_id: z
		.string()
		.describe(
			"The ID of the team to list projects for. Use the get_me tool to get available team IDs.",
		),
};

export async function listProjects(
	args: z.infer<z.ZodObject<typeof listProjectsSchema>>,
	token: string,
) {
	try {
		const projects = await apiClient.makeRequest(
			`/${args.team_id}/epics`,
			token,
		);
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(projects, null, 2),
				},
			],
		};
	} catch (error) {
		console.error("Error listing projects:", error);
		throw new Error("Failed to list projects.");
	}
}

export const getProjectSchema = {
	project_id: z.string().describe("The ID of the project to retrieve."),
};

export async function getProject(
	args: z.infer<z.ZodObject<typeof getProjectSchema>>,
	token: string,
) {
	try {
		const project = await apiClient.makeRequest(
			`/epics/${args.project_id}`,
			token,
		);
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(project, null, 2),
				},
			],
		};
	} catch (error) {
		console.error(`Error getting project ${args.project_id}:`, error);
		throw new Error(`Failed to get project ${args.project_id}.`);
	}
}

export function registerProjectTools(server: McpServer, authToken: string) {
	server.registerTool(
		"list_projects",
		{
			title: "List all projects (epics) in a team",
			description: "Fetches a list of all projects (epics) for a given team.",
			inputSchema: listProjectsSchema,
		},
		(args: z.infer<z.ZodObject<typeof listProjectsSchema>>) =>
			listProjects(args, authToken),
	);

	server.registerTool(
		"get_project",
		{
			title: "Get a project (epic) by ID",
			description:
				"Fetches detailed information about a specific project by its ID.",
			inputSchema: getProjectSchema,
		},
		(args: z.infer<z.ZodObject<typeof getProjectSchema>>) =>
			getProject(args, authToken),
	);
}
