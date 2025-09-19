import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

// Schema for creating a page
export const createPageSchema = z.object({
	team_id: z.string().describe("Team/workspace ID (from get_my_account tool)"),
	title: z.string().describe("Page title"),
	content: z.string().optional().describe("Page content/body"),
	project_id: z
		.string()
		.optional()
		.describe("Project ID to associate page with"),
	parent_page_id: z
		.string()
		.optional()
		.describe("Parent page ID for nested pages"),
});

// Schema for updating a page
export const updatePageSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	page_id: z.string().describe("Page ID to update"),
	title: z.string().optional().describe("Updated page title"),
	content: z.string().optional().describe("Updated page content"),
});

// Schema for getting a page
export const getPageSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	page_id: z.string().describe("Page ID to retrieve"),
});

// Schema for getting pages
export const getPagesSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	project_id: z.string().optional().describe("Filter pages by project ID"),
	cursor: z
		.string()
		.optional()
		.describe("Pagination cursor for large result sets"),
});

// Schema for archiving a page
export const archivePageSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	page_id: z.string().describe("Page ID to archive"),
});

/**
 * Creates a new page.
 * @param args - Contains team_id, title, and optional content, project_id, and parent_page_id.
 * @param token - The authentication token.
 * @returns The created page.
 */
export async function create_page(
	args: z.infer<typeof createPageSchema>,
	token: string,
) {
	// TODO: Implement create_page API call
	// Should call: POST Create a page
	// API endpoint: `/${team_id}/pages` with title, content, project_id, and parent_page_id in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"create_page function is a placeholder and not yet implemented",
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
 * Updates an existing page.
 * @param args - Contains team_id, page_id, and optional title and content.
 * @param token - The authentication token.
 * @returns The updated page.
 */
export async function update_page(
	args: z.infer<typeof updatePageSchema>,
	token: string,
) {
	// TODO: Implement update_page API call
	// Should call: PATCH Update a page
	// API endpoint: `/${team_id}/pages/${page_id}` with title and content in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"update_page function is a placeholder and not yet implemented",
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
 * Gets a specific page by ID.
 * @param args - Contains team_id and page_id.
 * @param token - The authentication token.
 * @returns The page details.
 */
export async function get_page(
	args: z.infer<typeof getPageSchema>,
	token: string,
) {
	// TODO: Implement get_page API call
	// Should call: GET Get a page
	// API endpoint: `/${team_id}/pages/${page_id}`

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"get_page function is a placeholder and not yet implemented",
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
 * Gets all pages for a team, optionally filtered by project.
 * @param args - Contains team_id and optional project_id and cursor.
 * @param token - The authentication token.
 * @returns A list of pages.
 */
export async function get_pages(
	args: z.infer<typeof getPagesSchema>,
	token: string,
) {
	// TODO: Implement get_pages API call
	// Should call: GET Get pages
	// API endpoint: `/${team_id}/pages` with optional project_id and cursor query parameters

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"get_pages function is a placeholder and not yet implemented",
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
 * Archives an existing page.
 * @param args - Contains team_id and page_id.
 * @param token - The authentication token.
 * @returns The archived page status.
 */
export async function archive_page(
	args: z.infer<typeof archivePageSchema>,
	token: string,
) {
	// TODO: Implement archive_page API call
	// Should call: PUT Archive a page
	// API endpoint: `/${team_id}/pages/${page_id}/archive`

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"archive_page function is a placeholder and not yet implemented",
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
 * Registers all page-related tools with the MCP server.
 * @param server - The MCP server instance.
 * @param authToken - The authentication token to be used by the tools.
 */
export function registerPageTools(server: McpServer, authToken: string) {
	server.registerTool(
		"create_page",
		{
			title: "Create Page",
			description: "Creates a new page with title and optional content.",
			inputSchema: createPageSchema.shape,
		},
		(args) => create_page(args, authToken),
	);

	server.registerTool(
		"update_page",
		{
			title: "Update Page",
			description: "Updates an existing page with new title and/or content.",
			inputSchema: updatePageSchema.shape,
		},
		(args) => update_page(args, authToken),
	);

	server.registerTool(
		"get_page",
		{
			title: "Get Page",
			description: "Gets a specific page by ID.",
			inputSchema: getPageSchema.shape,
		},
		(args) => get_page(args, authToken),
	);

	server.registerTool(
		"get_pages",
		{
			title: "Get Pages",
			description: "Gets all pages for a team, optionally filtered by project.",
			inputSchema: getPagesSchema.shape,
		},
		(args) => get_pages(args, authToken),
	);

	server.registerTool(
		"archive_page",
		{
			title: "Archive Page",
			description: "Archives an existing page.",
			inputSchema: archivePageSchema.shape,
		},
		(args) => archive_page(args, authToken),
	);
}
