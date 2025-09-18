import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

// Schema for creating a note
export const createNoteSchema = z.object({
	team_id: z.string().describe("Team/workspace ID (from get_my_account tool)"),
	title: z.string().describe("Note title"),
	content: z.string().optional().describe("Note content/body text"),
	project_id: z
		.string()
		.optional()
		.describe("Project ID to associate note with"),
});

// Schema for getting a note
export const getNoteSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	note_id: z.string().describe("Note ID to retrieve"),
});

// Schema for getting notes
export const getNotesSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	project_id: z.string().optional().describe("Filter notes by project ID"),
	cursor: z
		.string()
		.optional()
		.describe("Pagination cursor for large result sets"),
});

/**
 * Creates a new note.
 * @param args - Contains team_id, title, and optional content and project_id.
 * @param token - The authentication token.
 * @returns The created note.
 */
export async function create_note(
	args: z.infer<typeof createNoteSchema>,
	token: string,
) {
	// TODO: Implement create_note API call
	// Should call: POST Create a note
	// API endpoint: `/${team_id}/notes` with title, content, and project_id in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"create_note function is a placeholder and not yet implemented",
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
 * Gets a specific note by ID.
 * @param args - Contains team_id and note_id.
 * @param token - The authentication token.
 * @returns The note details.
 */
export async function get_note(
	args: z.infer<typeof getNoteSchema>,
	token: string,
) {
	// TODO: Implement get_note API call
	// Should call: GET Get a note
	// API endpoint: `/${team_id}/notes/${note_id}`

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"get_note function is a placeholder and not yet implemented",
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
 * Gets all notes for a team, optionally filtered by project.
 * @param args - Contains team_id and optional project_id and cursor.
 * @param token - The authentication token.
 * @returns A list of notes.
 */
export async function get_notes(
	args: z.infer<typeof getNotesSchema>,
	token: string,
) {
	// TODO: Implement get_notes API call
	// Should call: GET Get notes
	// API endpoint: `/${team_id}/notes` with optional project_id and cursor query parameters

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"get_notes function is a placeholder and not yet implemented",
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
 * Registers all note-related tools with the MCP server.
 * @param server - The MCP server instance.
 * @param authToken - The authentication token to be used by the tools.
 */
export function registerNoteTools(server: McpServer, authToken: string) {
	server.registerTool(
		"create_note",
		{
			title: "Create Note",
			description: "Creates a new note with title and optional content.",
			inputSchema: createNoteSchema.shape,
		},
		(args) => create_note(args, authToken),
	);

	server.registerTool(
		"get_note",
		{
			title: "Get Note",
			description: "Gets a specific note by ID.",
			inputSchema: getNoteSchema.shape,
		},
		(args) => get_note(args, authToken),
	);

	server.registerTool(
		"get_notes",
		{
			title: "Get Notes",
			description: "Gets all notes for a team, optionally filtered by project.",
			inputSchema: getNotesSchema.shape,
		},
		(args) => get_notes(args, authToken),
	);
}
