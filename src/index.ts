// Import actual tool implementations
import { getMe } from "./tools/user.js";
import { createCard, getCard, updateCard, deleteCard } from "./tools/cards.js";
import { getProject } from "./tools/projects.js";
import {
	createBoard,
	getBoard,
	listBoards,
	updateBoard,
	deleteBoard,
} from "./tools/boards.js";

/**
 * Creates a simple MCP handler that processes JSON-RPC requests directly
 */
function createMCPHandler(authToken: string) {
	return async (request: Request): Promise<Response> => {
		try {
			// Parse the JSON-RPC request
			const jsonRpcRequest = await request.json();
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
									name: "create_card",
									description:
										"Create a new card in a specified team and board",
									inputSchema: {
										type: "object",
										properties: {
											title: { type: "string", description: "Card title" },
											content: { type: "string", description: "Card content" },
											team_id: { type: "string", description: "Team ID" },
											board_id: { type: "string", description: "Board ID" },
										},
										required: ["title", "team_id", "board_id"],
									},
								},
								{
									name: "get_card",
									description: "Get detailed information about a specific card",
									inputSchema: {
										type: "object",
										properties: {
											card_id: { type: "string", description: "Card ID" },
										},
										required: ["card_id"],
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
										},
										required: ["title", "team_id"],
									},
								},
								{
									name: "list_boards",
									description: "List all boards in a team",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
										},
										required: ["team_id"],
									},
								},
							],
						},
						id,
					};
					break;

				case "tools/call":
					const toolName = params?.name;
					const toolArgs = params?.arguments || {};

					try {
						let toolResult: any;

						switch (toolName) {
							case "get_me":
								toolResult = await getMe(toolArgs, authToken);
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
							case "get_project":
								toolResult = await getProject(toolArgs, authToken);
								break;
							case "create_board":
								toolResult = await createBoard(toolArgs, authToken);
								break;
							case "get_board":
								toolResult = await getBoard(toolArgs, authToken);
								break;
							case "list_boards":
								toolResult = await listBoards(toolArgs, authToken);
								break;
							case "update_board":
								toolResult = await updateBoard(toolArgs, authToken);
								break;
							case "delete_board":
								toolResult = await deleteBoard(toolArgs, authToken);
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
