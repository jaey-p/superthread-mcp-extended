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

export const createProjectSchema = {
	team_id: z.string().describe("Team/workspace ID"),
	name: z.string().describe("Project name"),
	description: z.string().optional().describe("Project description"),
	color: z.string().optional().describe("Project color"),
};

export const updateProjectSchema = {
	team_id: z.string().describe("Team/workspace ID"),
	project_id: z.string().describe("Project ID to update"),
	name: z.string().optional().describe("Updated project name"),
	description: z.string().optional().describe("Updated project description"),
	color: z.string().optional().describe("Updated project color"),
};

export const getProjectsSchema = {
	team_id: z.string().describe("Team/workspace ID"),
	cursor: z.string().optional().describe("Pagination cursor"),
};

export const addRelatedCardToProjectSchema = {
	team_id: z.string().describe("Team/workspace ID"),
	project_id: z.string().describe("Project ID"),
	card_id: z.string().describe("Card ID to add to project"),
};

export const archiveProjectSchema = {
	team_id: z.string().describe("Team/workspace ID"),
	project_id: z.string().describe("Project ID to archive"),
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

export async function createProject(
	args: z.infer<z.ZodObject<typeof createProjectSchema>>,
	token: string,
) {
	try {
		const { team_id, ...payload } = args;
		const project = await apiClient.makeRequest(`/${team_id}/epics`, token, {
			method: "POST",
			body: JSON.stringify(payload),
		});
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(project, null, 2),
				},
			],
		};
	} catch (error) {
		console.error("Error creating project:", error);
		throw new Error("Failed to create project.");
	}
}

export async function updateProject(
	args: z.infer<z.ZodObject<typeof updateProjectSchema>>,
	token: string,
) {
	try {
		const { team_id, project_id, ...payload } = args;
		const project = await apiClient.makeRequest(
			`/${team_id}/epics/${project_id}`,
			token,
			{
				method: "PATCH",
				body: JSON.stringify(payload),
			},
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
		console.error(`Error updating project ${args.project_id}:`, error);
		throw new Error(`Failed to update project ${args.project_id}.`);
	}
}

export async function getProjects(
	args: z.infer<z.ZodObject<typeof getProjectsSchema>>,
	token: string,
) {
	try {
		const { team_id, cursor } = args;
		const queryParams = cursor ? `?cursor=${cursor}` : "";
		const projects = await apiClient.makeRequest(
			`/${team_id}/epics${queryParams}`,
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
		console.error("Error getting projects:", error);
		throw new Error("Failed to get projects.");
	}
}

export async function addRelatedCardToProject(
	args: z.infer<z.ZodObject<typeof addRelatedCardToProjectSchema>>,
	token: string,
) {
	try {
		const { team_id, project_id, card_id } = args;
		const result = await apiClient.makeRequest(
			`/${team_id}/epics/${project_id}/related`,
			token,
			{
				method: "POST",
				body: JSON.stringify({ card_id }),
			},
		);
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	} catch (error) {
		console.error(`Error adding card to project ${args.project_id}:`, error);
		throw new Error(`Failed to add card to project ${args.project_id}.`);
	}
}

export async function archiveProject(
	args: z.infer<z.ZodObject<typeof archiveProjectSchema>>,
	token: string,
) {
	try {
		const { team_id, project_id } = args;
		const project = await apiClient.makeRequest(
			`/${team_id}/epics/${project_id}`,
			token,
			{
				method: "PATCH",
				body: JSON.stringify({ archived: true }),
			},
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
		console.error(`Error archiving project ${args.project_id}:`, error);
		throw new Error(`Failed to archive project ${args.project_id}.`);
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

	server.registerTool(
		"create_project",
		{
			title: "Create a new project (epic)",
			description: "Creates a new project (epic) in the specified team.",
			inputSchema: createProjectSchema,
		},
		(args: z.infer<z.ZodObject<typeof createProjectSchema>>) =>
			createProject(args, authToken),
	);

	server.registerTool(
		"update_project",
		{
			title: "Update a project (epic)",
			description: "Updates an existing project's properties.",
			inputSchema: updateProjectSchema,
		},
		(args: z.infer<z.ZodObject<typeof updateProjectSchema>>) =>
			updateProject(args, authToken),
	);

	server.registerTool(
		"get_projects",
		{
			title: "Get projects (epics) for a team",
			description: "Fetches projects for a team with optional pagination.",
			inputSchema: getProjectsSchema,
		},
		(args: z.infer<z.ZodObject<typeof getProjectsSchema>>) =>
			getProjects(args, authToken),
	);

	server.registerTool(
		"add_related_card_to_project",
		{
			title: "Add related card to project",
			description: "Adds a card as related to a specific project.",
			inputSchema: addRelatedCardToProjectSchema,
		},
		(args: z.infer<z.ZodObject<typeof addRelatedCardToProjectSchema>>) =>
			addRelatedCardToProject(args, authToken),
	);

	server.registerTool(
		"archive_project",
		{
			title: "Archive a project (epic)",
			description: "Archives a specific project by its ID.",
			inputSchema: archiveProjectSchema,
		},
		(args: z.infer<z.ZodObject<typeof archiveProjectSchema>>) =>
			archiveProject(args, authToken),
	);
}
