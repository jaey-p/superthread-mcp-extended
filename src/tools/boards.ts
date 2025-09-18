import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";
import { search } from "../lib/search.js";
import type { Board, BoardSearchResult } from "../types/boards.js";
import { getUserFromToken, getUserTeams } from "./user.js";

const createBoardSchema = z.object({
	team_id: z
		.string()
		.describe(
			"The ID of the team to create the board in. Use `get_me` to find available team IDs.",
		),
	project_id: z
		.string()
		.describe("The ID of the project to associate the board with."),
	title: z.string().describe("The title of the board."),
	content: z
		.string()
		.optional()
		.describe("The description or content for the board."),
	icon: z.string().optional().describe("An icon to represent the board."),
	color: z.string().optional().describe("A color to associate with the board."),
	layout: z
		.string()
		.optional()
		.default("board")
		.describe('The layout of the board, defaults to "board".'),
});

export async function create_board(
	args: z.infer<typeof createBoardSchema>,
	token: string,
): Promise<Board> {
	const { team_id, ...payload } = args;

	if (!team_id) {
		throw new Error("`team_id` is required to create a board.");
	}

	const user = await getUserFromToken(token);
	const teams = await getUserTeams(user);
	const team = teams.find((t: any) => t.id === team_id);

	if (!team) {
		throw new Error(
			`Team with ID "${team_id}" not found or you don't have access.`,
		);
	}

	if (team.role !== "admin" && team.role !== "owner") {
		throw new Error(
			`You must be an admin or owner to create a board in the "${team.name}" team.`,
		);
	}

	return await apiClient.makeRequest(`/v1/${team_id}/boards`, token, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

const updateBoardSchema = z.object({
	team_id: z.string().describe("The ID of the team containing the board."),
	board_id: z.string().describe("The ID of the board to update."),
	project_id: z
		.string()
		.optional()
		.describe("The new project ID to associate the board with."),
	title: z.string().optional().describe("The new title for the board."),
	content: z
		.string()
		.optional()
		.describe("The new description or content for the board."),
	icon: z.string().optional().describe("The new icon for the board."),
	color: z.string().optional().describe("The new color for the board."),
	archived: z.boolean().optional().describe("Whether to archive the board."),
});

export async function update_board(
	args: z.infer<typeof updateBoardSchema>,
	token: string,
): Promise<Board> {
	const { team_id, board_id, ...payload } = args;
	return await apiClient.makeRequest(`/${team_id}/boards/${board_id}`, token, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}

const getBoardsSchema = z.object({
	team_id: z.string().describe("The ID of the team to list boards from."),
	project_id: z
		.string()
		.optional()
		.describe("Filter boards by a specific project ID."),
	bookmarked: z.boolean().optional().describe("Filter for bookmarked boards."),
	archived: z.boolean().optional().describe("Filter for archived boards."),
});

export async function get_boards(
	args: z.infer<typeof getBoardsSchema>,
	token: string,
): Promise<Board[]> {
	const { team_id, ...queryParams } = args;
	const params = new URLSearchParams();

	if (queryParams.project_id)
		params.append("project_id", queryParams.project_id);
	if (queryParams.bookmarked !== undefined)
		params.append("bookmarked", String(queryParams.bookmarked));
	if (queryParams.archived !== undefined)
		params.append("archived", String(queryParams.archived));

	if (params.toString() === "") {
		throw new Error(
			"At least one of `project_id`, `bookmarked`, or `archived` must be provided.",
		);
	}

	return await apiClient.makeRequest(
		`/${team_id}/boards?${params.toString()}`,
		token,
	);
}

const getBoardSchema = z.object({
	query: z.string().describe("The title or ID of the board to search for."),
});

export async function get_board(
	args: z.infer<typeof getBoardSchema>,
	token: string,
): Promise<Board[]> {
	const user = await getUserFromToken(token);
	const teamIds = await getUserTeams(user).then((teams: any[]) =>
		teams.map((t: any) => t.id),
	);
	const seenBoards = new Map<
		string,
		{ board: BoardSearchResult; teamId: string }
	>();

	for (const teamId of teamIds) {
		const results = await search(teamId, token, {
			query: args.query,
			types: ["boards"],
		});
		results.boards?.forEach((board) => {
			if (!seenBoards.has(board.id)) {
				seenBoards.set(board.id, { board, teamId });
			}
		});
	}

	if (seenBoards.size === 0) {
		throw new Error(`No boards found matching query: "${args.query}"`);
	}

	const boardDetails = await Promise.all(
		Array.from(seenBoards.values()).map(({ board, teamId }) =>
			apiClient
				.makeRequest(`/${teamId}/boards/${board.id}`, token)
				.then((res: any) => res.board),
		),
	);

	return boardDetails;
}

const deleteBoardSchema = z.object({
	team_id: z.string().describe("The ID of the team containing the board."),
	board_id: z.string().describe("The ID of the board to delete."),
});

const duplicateBoardSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	board_id: z.string().describe("Board ID to duplicate"),
	title: z.string().optional().describe("Title for duplicated board"),
	project_id: z.string().optional().describe("Project ID for duplicated board"),
});

export async function delete_board(
	args: z.infer<typeof deleteBoardSchema>,
	token: string,
): Promise<{ success: boolean }> {
	await apiClient.makeRequest(
		`/${args.team_id}/boards/${args.board_id}`,
		token,
		{
			method: "DELETE",
		},
	);
	return { success: true };
}

export async function duplicate_board(
	args: z.infer<typeof duplicateBoardSchema>,
	token: string,
): Promise<Board> {
	const { team_id, board_id, ...payload } = args;
	return await apiClient.makeRequest(
		`/${team_id}/boards/${board_id}/duplicate`,
		token,
		{
			method: "POST",
			body: JSON.stringify(payload),
		},
	);
}

export function registerBoardTools(server: McpServer, authToken: string) {
	server.registerTool(
		"create_board",
		{
			title: "Create Board",
			description:
				"Creates a new board. The user must be an admin or owner of the team to create a board.",
			inputSchema: createBoardSchema.shape,
		},
		async (args) => {
			const result = await create_board(args, authToken);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		},
	);

	server.registerTool(
		"update_board",
		{
			title: "Update Board",
			description: "Updates an existing board's properties.",
			inputSchema: updateBoardSchema.shape,
		},
		async (args) => {
			const result = await update_board(args, authToken);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		},
	);

	server.registerTool(
		"get_boards",
		{
			title: "List Boards",
			description:
				"Lists boards for a team, filtered by project, bookmark status, or archived status. At least one filter is required.",
			inputSchema: getBoardsSchema.shape,
		},
		async (args) => {
			const result = await get_boards(args, authToken);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		},
	);

	server.registerTool(
		"get_board",
		{
			title: "Get Board",
			description:
				"Retrieves detailed information about one or more boards by searching for a title or ID.",
			inputSchema: getBoardSchema.shape,
		},
		async (args) => {
			const result = await get_board(args, authToken);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		},
	);

	server.registerTool(
		"delete_board",
		{
			title: "Delete Board",
			description: "Deletes a board.",
			inputSchema: deleteBoardSchema.shape,
		},
		async (args) => {
			const result = await delete_board(args, authToken);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		},
	);

	server.registerTool(
		"duplicate_board",
		{
			title: "Duplicate Board",
			description: "Creates a duplicate of an existing board.",
			inputSchema: duplicateBoardSchema.shape,
		},
		async (args) => {
			const result = await duplicate_board(args, authToken);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
			};
		},
	);
}
