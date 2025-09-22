// Import essential MVP tool functions only
import { get_my_account } from "./tools/user.js";
import {
	createCard,
	getCard,
	updateCard,
	addRelatedCard,
	archiveCard,
} from "./tools/cards.js";
import { get_board_details } from "./tools/boards.js";
import { get_spaces } from "./tools/spaces.js";

/**
 * Creates a simple MCP handler that processes JSON-RPC requests directly
 * Simplified for MVP screenshot-to-tasks workflow focus
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
								version: "2.0.0-mvp",
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
								// Essential MVP Tools for Screenshot-to-Tasks Workflow
								{
									name: "get_my_account",
									description:
										"Get current user information with team ID (simplified response)",
									inputSchema: { type: "object", properties: {} },
								},
								{
									name: "get_spaces",
									description:
										"Get all workspaces with nested boards (simplified response)",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											cursor: {
												type: "string",
												description: "Pagination cursor",
											},
										},
										required: ["team_id"],
									},
								},
								{
									name: "get_board_details",
									description:
										"Get board details with lists for task creation (simplified response)",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											board_id: { type: "string", description: "Board ID" },
										},
										required: ["team_id", "board_id"],
									},
								},
								{
									name: "create_card",
									description: "Create a new task card in a specified list",
									inputSchema: {
										type: "object",
										properties: {
											title: { type: "string", description: "Card title" },
											content: { type: "string", description: "Card content" },
											team_id: { type: "string", description: "Team ID" },
											list_id: { type: "string", description: "List ID" },
											project_id: { type: "string", description: "Project ID" },
											board_id: { type: "string", description: "Board ID" },
										},
										required: ["title", "team_id", "list_id", "board_id"],
									},
								},
								{
									name: "get_card",
									description: "Get detailed information about a specific card",
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
									name: "add_related_card",
									description: "Add related card relationship",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
											related_card_id: {
												type: "string",
												description: "Related card ID",
											},
											relation_type: {
												type: "string",
												enum: ["blocks", "blocked_by", "relates_to"],
												description: "Relation type",
											},
										},
										required: [
											"team_id",
											"card_id",
											"related_card_id",
											"relation_type",
										],
									},
								},
								{
									name: "archive_card",
									description: "Archive a card",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
										},
										required: ["team_id", "card_id"],
									},
								},
							],
						},
						id,
					};
					break;

				case "prompts/list":
					responseData = {
						jsonrpc: "2.0",
						result: {
							prompts: [
								{
									name: "screenshot-to-tasks",
									description:
										"Convert screenshot content into actionable Superthread tasks",
									arguments: [
										{
											name: "screenshot_description",
											description:
												"Description of what's shown in the screenshot",
											required: true,
										},
										{
											name: "project_context",
											description:
												"Context about the project these tasks belong to",
											required: false,
										},
									],
								},
							],
						},
						id,
					};
					break;

				case "prompts/get": {
					const promptName = params?.name;
					const promptArgs = params?.arguments || {};

					let promptResult: any;

					switch (promptName) {
						case "screenshot-to-tasks":
							promptResult = {
								description: "Convert screenshot content into actionable tasks",
								messages: [
									{
										role: "user",
										content: {
											type: "text",
											text: `Convert this screenshot content into actionable Superthread tasks: "${promptArgs.screenshot_description || "[SCREENSHOT_DESCRIPTION]"}"

${promptArgs.project_context ? `Project context: ${promptArgs.project_context}` : ""}

Please create specific, actionable tasks that:
1. Are clearly defined and measurable
2. Can be completed by a single person
3. Have clear acceptance criteria
4. Are properly prioritized

For each task, provide:
- Title: Clear, concise task name
- Description: Detailed description with acceptance criteria
- Priority: High, Medium, or Low
- Estimated effort: Time or complexity estimate

Format the output for easy import into Superthread using the create_card tool.`,
										},
									},
								],
							};
							break;

						default:
							responseData = {
								jsonrpc: "2.0",
								error: {
									code: -32601,
									message: `Unknown prompt: ${promptName}`,
								},
								id,
							};
							break;
					}

					if (promptResult) {
						responseData = {
							jsonrpc: "2.0",
							result: promptResult,
							id,
						};
					}
					break;
				}

				case "tools/call": {
					const toolName = params?.name;
					const toolArgs = params?.arguments || {};

					try {
						let toolResult: any;

						switch (toolName) {
							// Essential MVP Tools
							case "get_my_account":
								toolResult = await get_my_account(toolArgs, authToken);
								break;
							case "get_spaces":
								toolResult = await get_spaces(toolArgs, authToken);
								break;
							case "get_board_details":
								toolResult = await get_board_details(toolArgs, authToken);
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
							case "add_related_card":
								toolResult = await addRelatedCard(toolArgs, authToken);
								break;
							case "archive_card":
								toolResult = await archiveCard(toolArgs, authToken);
								break;
							default:
								responseData = {
									jsonrpc: "2.0",
									error: {
										code: -32601,
										message: `Unknown tool: ${toolName}. Available tools: get_my_account, get_spaces, get_board_details, create_card, get_card, update_card, add_related_card, archive_card`,
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
			return createErrorResponse(-32603, "Internal server error");
		}
	},
};
