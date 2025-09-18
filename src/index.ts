// Import actual tool implementations
import { get_me, update_me } from "./tools/user.js";
import { createCard, getCard, updateCard, deleteCard } from "./tools/cards.js";
import { getProject, listProjects } from "./tools/projects.js";
import {
	create_board,
	get_board,
	list_boards,
	update_board,
	delete_board,
} from "./tools/boards.js";

/**
 * Creates a simple MCP handler that processes JSON-RPC requests directly
 */
function createMCPHandler(authToken: string) {
	return async (request: Request): Promise<Response> => {
		try {
			// Parse the JSON-RPC request
			const jsonRpcRequest = (await request.json()) as any;
			const { method, params, id } = jsonRpcRequest;

			// Handle different MCP methods
			let responseData: any;

			switch (method) {
				case "initialize":
					responseData = {
						jsonrpc: "2.0",
						result: {
							protocolVersion: "2025-03-26",
							capabilities: {
								tools: {},
								resources: {},
								prompts: {},
							},
							serverInfo: {
								name: "superthread-mcp",
								version: "1.0.0",
							},
						},
						id,
					};
					break;

				case "tools/list":
					responseData = {
						jsonrpc: "2.0",
						result: {
							tools: [
								{
									name: "get_me",
									description: "Get current user information",
									inputSchema: {
										type: "object",
										properties: {},
									},
								},
								{
									name: "update_me",
									description: "Update current user profile information",
									inputSchema: {
										type: "object",
										properties: {
											first_name: { type: "string", description: "First name" },
											last_name: { type: "string", description: "Last name" },
											display_name: {
												type: "string",
												description: "Display name",
											},
											profile_image: {
												type: "string",
												description: "Profile image URL",
											},
											timezone_id: {
												type: "string",
												description: "Timezone ID",
											},
											locale: { type: "string", description: "Locale" },
										},
									},
								},
								{
									name: "create_card",
									description:
										"Create a new card in a specified team and board",
									inputSchema: {
										type: "object",
										properties: {
											title: { type: "string", description: "Card title" },
											content: { type: "string", description: "Card content" },
											team_id: { type: "string", description: "Team ID" },
											list_id: { type: "string", description: "List ID" },
											board_id: { type: "string", description: "Board ID" },
										},
										required: ["title", "team_id", "list_id"],
									},
								},
								{
									name: "get_card",
									description: "Get detailed information about a specific card",
									inputSchema: {
										type: "object",
										properties: {
											query: {
												type: "string",
												description: "Card title or identifier to search for",
											},
										},
										required: ["query"],
									},
								},
								{
									name: "update_card",
									description: "Update a card's attributes",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
											title: { type: "string", description: "Card title" },
											content: { type: "string", description: "Card content" },
										},
										required: ["team_id", "card_id"],
									},
								},
								{
									name: "delete_card",
									description: "Delete a specific card",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
										},
										required: ["team_id", "card_id"],
									},
								},
								{
									name: "list_projects",
									description: "List all projects in a team",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
										},
										required: ["team_id"],
									},
								},
								{
									name: "get_project",
									description:
										"Get detailed information about a specific project",
									inputSchema: {
										type: "object",
										properties: {
											query: {
												type: "string",
												description:
													"Project name or description to search for",
											},
											exact_match: {
												type: "boolean",
												description: "Whether to return only exact matches",
											},
										},
										required: ["query"],
									},
								},
								{
									name: "create_board",
									description: "Create a new board in a team",
									inputSchema: {
										type: "object",
										properties: {
											title: { type: "string", description: "Board title" },
											team_id: { type: "string", description: "Team ID" },
											project_id: { type: "string", description: "Project ID" },
											content: {
												type: "string",
												description: "Board description",
											},
										},
										required: ["title", "team_id"],
									},
								},
								{
									name: "update_board",
									description: "Update an existing board",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											board_id: { type: "string", description: "Board ID" },
											title: { type: "string", description: "Board title" },
											content: {
												type: "string",
												description: "Board description",
											},
										},
										required: ["team_id", "board_id"],
									},
								},
								{
									name: "list_boards",
									description: "List all boards in a team",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											project_id: {
												type: "string",
												description: "Project ID to filter by",
											},
											bookmarked: {
												type: "boolean",
												description: "Filter for bookmarked boards",
											},
											archived: {
												type: "boolean",
												description: "Filter for archived boards",
											},
										},
										required: ["team_id"],
									},
								},
								{
									name: "get_board",
									description:
										"Get detailed information about a specific board",
									inputSchema: {
										type: "object",
										properties: {
											query: {
												type: "string",
												description: "Board title or identifier to search for",
											},
										},
										required: ["query"],
									},
								},
								{
									name: "delete_board",
									description: "Delete a specific board",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											board_id: { type: "string", description: "Board ID" },
										},
										required: ["team_id", "board_id"],
									},
								},
							],
						},
						id,
					};
					break;

				case "tools/call": {
					const toolName = params?.name;
					const toolArgs = params?.arguments || {};

					try {
						let toolResult: any;

						switch (toolName) {
							case "get_me":
								toolResult = await get_me(toolArgs, authToken);
								break;
							case "update_me":
								toolResult = await update_me(toolArgs, authToken);
								break;
							case "create_card":
								toolResult = await createCard(toolArgs, authToken);
								break;
							case "get_card":
								toolResult = await getCard(toolArgs, authToken);
								break;
							case "update_card":
								toolResult = await updateCard(toolArgs, authToken);
								break;
							case "delete_card":
								toolResult = await deleteCard(toolArgs, authToken);
								break;
							case "list_projects":
								toolResult = await listProjects(toolArgs, authToken);
								break;
							case "get_project":
								toolResult = await getProject(toolArgs, authToken);
								break;
							case "create_board":
								toolResult = await create_board(toolArgs, authToken);
								break;
							case "get_board":
								toolResult = await get_board(toolArgs, authToken);
								break;
							case "list_boards":
								toolResult = await list_boards(toolArgs, authToken);
								break;
							case "update_board":
								toolResult = await update_board(toolArgs, authToken);
								break;
							case "delete_board":
								toolResult = await delete_board(toolArgs, authToken);
								break;
							default:
								responseData = {
									jsonrpc: "2.0",
									error: {
										code: -32601,
										message: `Unknown tool: ${toolName}`,
									},
									id,
								};
								break;
						}

						if (toolResult) {
							responseData = {
								jsonrpc: "2.0",
								result: toolResult,
								id,
							};
						}
					} catch (toolError: any) {
						console.error(`Error calling tool ${toolName}:`, toolError);
						responseData = {
							jsonrpc: "2.0",
							error: {
								code: -32000,
								message: `Tool execution failed: ${toolError?.message || "Unknown error"}`,
							},
							id,
						};
					}
					break;
				}

				default:
					responseData = {
						jsonrpc: "2.0",
						error: {
							code: -32601,
							message: `Method not found: ${method}`,
						},
						id,
					};
			}

			return new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Error handling MCP request:", error);
			return new Response(
				JSON.stringify({
					jsonrpc: "2.0",
					error: {
						code: -32603,
						message: "Internal server error",
					},
					id: null,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	};
}
/**
 * Extracts Bearer token from Authorization header
 */
function extractBearerToken(request: Request): string | null {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader) {
		return null;
	}

	const match = authHeader.match(/^Bearer\s+(stp-.+)$/);
	return match ? match[1] : null;
}

/**
 * Creates a JSON-RPC error response
 */
function createErrorResponse(
	code: number,
	message: string,
	id: any = null,
): Response {
	return new Response(
		JSON.stringify({
			jsonrpc: "2.0",
			error: { code, message },
			id,
		}),
		{
			status: 401,
			headers: { "Content-Type": "application/json" },
		},
	);
}

export default {
	async fetch(request: Request, _env: Env, _ctx: any): Promise<Response> {
		const url = new URL(request.url);

		// Only handle POST requests to /mcp/app endpoint
		if (request.method !== "POST" || url.pathname !== "/mcp/app") {
			return new Response("Not Found", { status: 404 });
		}

		// Extract Bearer token from Authorization header
		const authToken = extractBearerToken(request);
		if (!authToken) {
			return createErrorResponse(
				-32600,
				"Missing or invalid Authorization header. Expected: Bearer stp-xxx",
			);
		}

		try {
			// Create MCP handler with the extracted token
			const mcpHandler = createMCPHandler(authToken);

			// Handle the MCP request
			return await mcpHandler(request);
		} catch (error) {
			console.error("Error processing MCP request:", error);
			return createErrorResponse(-32603, "Internal server error");
		}
	},
};
