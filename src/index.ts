// Import essential MVP tool functions only
import { get_my_account } from "./tools/user.js";
import {
	createCard,
	getCard,
	updateCard,
	addRelatedCard,
	archiveCard,
	addCardMember,
	removeCardMember,
	addCardTag,
	removeCardTag,
} from "./tools/cards.js";
import { get_board_details } from "./tools/boards.js";
import { get_spaces } from "./tools/spaces.js";
import { get_tags, create_tag } from "./tools/tags.js";
import {
	createChecklist,
	updateChecklist,
	deleteChecklist,
	addChecklistItem,
	updateChecklistItem,
	deleteChecklistItem,
} from "./tools/checklists.js";

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
											content: {
												type: "string",
												description: "Card description",
											},
											team_id: {
												type: "string",
												description:
													"Use the get_my_account tool first to get the team IDs available",
											},
											list_id: {
												type: "string",
												description: "List ID where the card will be placed",
											},
											project_id: {
												type: "string",
												description: "Project ID the card belongs to",
											},
											board_id: {
												type: "string",
												description:
													"Board ID (required if sprint_id not provided)",
											},
											sprint_id: {
												type: "string",
												description: "Sprint ID (required if board_id not provided)",
											},
											owner_id: {
												type: "string",
												description: "Owner user ID",
											},
											priority: {
												type: "number",
												description: "Priority level (numeric)",
											},
											estimate: {
												type: "number",
												description: "Estimate in story points",
											},
											start_date: {
												type: "number",
												description: "Start date as Unix timestamp",
											},
											due_date: {
												type: "number",
												description: "Due date as Unix timestamp",
											},
											parent_card_id: {
												type: "string",
												description: "Parent card ID",
											},
											epic_id: { type: "string", description: "Epic ID" },
											tag_ids: {
												type: "array",
												items: { type: "string" },
												description: "Array of tag IDs to add to the card",
											},
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
											team_id: { type: "string", description: "Team/workspace ID" },
											card_id: {
												type: "string",
												description: "The unique identifier for the card to update",
											},
											title: { type: "string", description: "New card title" },
											content: {
												type: "string",
												description: "New card description",
											},
											board_id: { type: "string", description: "New board ID" },
											list_id: {
												type: "string",
												description:
													"New list ID. Changing this moves the card to a different list (work status). Use with position to set the card's position in the new list.",
											},
											project_id: {
												type: "string",
												description: "New project ID",
											},
											sprint_id: { type: "string", description: "New sprint ID" },
											owner_id: {
												type: "string",
												description: "New owner user ID",
											},
											start_date: {
												type: "number",
												description: "New start date as Unix timestamp",
											},
											due_date: {
												type: "number",
												description: "New due date as Unix timestamp",
											},
											position: {
												type: "number",
												description:
													"New position in list (0-based index). Use with list_id to move card to a different list and set its position.",
											},
											priority: {
												type: "number",
												description: "New priority level (numeric)",
											},
											estimate: {
												type: "number",
												description: "New estimate in story points",
											},
											archived: {
												type: "boolean",
												description: "Archive/unarchive the card",
											},
											tag_ids: {
												type: "array",
												items: { type: "string" },
												description:
													"Array of tag IDs to add to the card. Replaces existing tags if provided.",
											},
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
								{
									name: "add_card_member",
									description:
										"Add a member (assignee) to a card with optional role. Use this to assign tasks to users.",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
											user_id: {
												type: "string",
												description: "User ID to add as member",
											},
											role: {
												type: "string",
												enum: ["member", "admin", "viewer"],
												description: "Member role (default: member)",
											},
										},
										required: ["team_id", "card_id", "user_id"],
									},
								},
								{
									name: "remove_card_member",
									description: "Remove a member (assignee) from a card",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
											user_id: {
												type: "string",
												description: "User ID to remove",
											},
										},
										required: ["team_id", "card_id", "user_id"],
									},
								},
								{
									name: "add_card_tag",
									description:
										"Add a tag to a card by tag ID. Tags must be added one at a time.",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
											tag_id: { type: "string", description: "Tag ID to add" },
										},
										required: ["team_id", "card_id", "tag_id"],
									},
								},
								{
									name: "remove_card_tag",
									description: "Remove a tag from a card by tag ID",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
											tag_id: { type: "string", description: "Tag ID to remove" },
										},
										required: ["team_id", "card_id", "tag_id"],
									},
								},
								{
									name: "get_tags",
									description:
										"Get all tags for a team, optionally filtered by project ID",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											project_id: {
												type: "string",
												description: "Project ID to filter tags (optional)",
											},
										},
										required: ["team_id"],
									},
								},
								{
									name: "create_tag",
									description:
										"Create a new tag with name, color, and optional project",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											name: { type: "string", description: "Tag name" },
											color: {
												type: "string",
												description: "Tag color in hex format (e.g., #667085)",
											},
											project_id: {
												type: "string",
												description:
													"Project ID to associate the tag with (optional)",
											},
										},
										required: ["team_id", "name"],
									},
								},
								// Checklist Tools
								{
									name: "create_checklist",
									description: "Create a new checklist on a card",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: {
												type: "string",
												description: "Card ID to add checklist to",
											},
											title: {
												type: "string",
												description: "Checklist title",
											},
										},
										required: ["team_id", "card_id", "title"],
									},
								},
								{
									name: "update_checklist",
									description: "Update a checklist title",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: {
												type: "string",
												description: "Card ID containing the checklist",
											},
											checklist_id: {
												type: "string",
												description: "Checklist ID to update",
											},
											title: {
												type: "string",
												description: "New checklist title",
											},
										},
										required: ["team_id", "card_id", "checklist_id", "title"],
									},
								},
								{
									name: "delete_checklist",
									description: "Delete a checklist from a card",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: {
												type: "string",
												description: "Card ID containing the checklist",
											},
											checklist_id: {
												type: "string",
												description: "Checklist ID to delete",
											},
										},
										required: ["team_id", "card_id", "checklist_id"],
									},
								},
								{
									name: "add_checklist_item",
									description: "Add an item to a checklist",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: {
												type: "string",
												description: "Card ID containing the checklist",
											},
											checklist_id: {
												type: "string",
												description: "Checklist ID to add item to",
											},
											title: {
												type: "string",
												description: "Checklist item title",
											},
										},
										required: ["team_id", "card_id", "checklist_id", "title"],
									},
								},
								{
									name: "update_checklist_item",
									description:
										"Update a checklist item (change title or check/uncheck)",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: {
												type: "string",
												description: "Card ID containing the checklist",
											},
											checklist_id: {
												type: "string",
												description: "Checklist ID containing the item",
											},
											item_id: {
												type: "string",
												description: "Checklist item ID to update",
											},
											title: {
												type: "string",
												description: "New title for the checklist item",
											},
											checked: {
												type: "boolean",
												description: "Check/uncheck the item",
											},
										},
										required: ["team_id", "card_id", "checklist_id", "item_id"],
									},
								},
								{
									name: "delete_checklist_item",
									description: "Delete an item from a checklist",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: {
												type: "string",
												description: "Card ID containing the checklist",
											},
											checklist_id: {
												type: "string",
												description: "Checklist ID containing the item",
											},
											item_id: {
												type: "string",
												description: "Checklist item ID to delete",
											},
										},
										required: ["team_id", "card_id", "checklist_id", "item_id"],
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
							case "add_card_member":
								toolResult = await addCardMember(toolArgs, authToken);
								break;
							case "remove_card_member":
								toolResult = await removeCardMember(toolArgs, authToken);
								break;
							case "add_card_tag":
								toolResult = await addCardTag(toolArgs, authToken);
								break;
							case "remove_card_tag":
								toolResult = await removeCardTag(toolArgs, authToken);
								break;
							case "get_tags":
								toolResult = await get_tags(toolArgs, authToken);
								break;
							case "create_tag":
								toolResult = await create_tag(toolArgs, authToken);
								break;
							// Checklist tools
							case "create_checklist":
								toolResult = await createChecklist(toolArgs, authToken);
								break;
							case "update_checklist":
								toolResult = await updateChecklist(toolArgs, authToken);
								break;
							case "delete_checklist":
								toolResult = await deleteChecklist(toolArgs, authToken);
								break;
							case "add_checklist_item":
								toolResult = await addChecklistItem(toolArgs, authToken);
								break;
							case "update_checklist_item":
								toolResult = await updateChecklistItem(toolArgs, authToken);
								break;
							case "delete_checklist_item":
								toolResult = await deleteChecklistItem(toolArgs, authToken);
								break;
							default:
								responseData = {
									jsonrpc: "2.0",
									error: {
										code: -32601,
										message: `Unknown tool: ${toolName}. Available tools: get_my_account, get_spaces, get_board_details, create_card, get_card, update_card, add_related_card, archive_card, add_card_member, remove_card_member, add_card_tag, remove_card_tag, get_tags, create_tag, create_checklist, update_checklist, delete_checklist, add_checklist_item, update_checklist_item, delete_checklist_item`,
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

	// More flexible matching: case-insensitive Bearer, allow multiple spaces
	const match = authHeader.match(/^Bearer\s+(stp-.+)$/i);
	if (match) {
		return match[1].trim();
	}

	// Fallback: if header starts with "stp-", assume it's the token directly
	if (authHeader.trim().startsWith("stp-")) {
		return authHeader.trim();
	}

	return null;
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
		const pathname = url.pathname;

		// Handle OAuth discovery endpoints - return proper OAuth 2.0 metadata format
		// This server uses Bearer token authentication only, not OAuth flow
		if (
			request.method === "GET" &&
			(pathname.includes("/.well-known/oauth") ||
				pathname.includes("/.well-known/openid"))
		) {
			const baseUrl = `${url.protocol}//${url.host}`;
			return new Response(
				JSON.stringify({
					issuer: baseUrl,
					authorization_endpoint: `${baseUrl}/mcp/app/auth`,
					token_endpoint: `${baseUrl}/mcp/app/token`,
					registration_endpoint: `${baseUrl}/register`,
					response_types_supported: ["code", "bearer_token"],
					token_endpoint_auth_methods_supported: ["none"],
					scopes_supported: ["mcp"],
					// Indicate that this server uses Bearer token in Authorization header
					bearer_token_supported: true,
					bearer_token_location: "header",
					bearer_token_format: "Bearer stp-xxx",
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Handle OAuth authorization endpoint
		// Since this server uses Bearer token authentication, we generate a dummy auth code
		// The actual authentication happens via Bearer token in headers
		if (request.method === "GET" && pathname === "/mcp/app/auth") {
			const redirectUri = url.searchParams.get("redirect_uri");
			const state = url.searchParams.get("state");
			const code = "bearer-token-auth-code"; // Dummy code since we use Bearer tokens

			if (redirectUri) {
				const redirectUrl = new URL(redirectUri);
				redirectUrl.searchParams.set("code", code);
				if (state) {
					redirectUrl.searchParams.set("state", state);
				}
				return Response.redirect(redirectUrl.toString(), 302);
			}

			// Fallback if no redirect_uri
			return new Response(
				JSON.stringify({
					code,
					state,
					message:
						"This server uses Bearer token authentication. The authorization code is for OAuth compatibility only.",
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Handle OAuth token endpoint
		// Since this server uses Bearer token authentication, we return a dummy access token
		// The actual authentication happens via Bearer token in headers
		if (request.method === "POST" && pathname === "/mcp/app/token") {
			try {
				const body = (await request.json().catch(() => ({}))) as {
					grant_type?: string;
					code?: string;
					redirect_uri?: string;
					client_id?: string;
					code_verifier?: string;
				};

				// Log for debugging (will stay commented out in prod)
				// console.log("Token endpoint request body:", JSON.stringify(body, null, 2));

				const grantType = body.grant_type || "authorization_code"; // Default to authorization_code if not provided

				// For authorization_code grant (or default), return a dummy token
				// This allows Claude Code to complete OAuth flow even if grant_type is missing
				if (grantType === "authorization_code" || !body.grant_type) {
					return new Response(
						JSON.stringify({
							access_token: "bearer-token-dummy-access-token",
							token_type: "Bearer",
							expires_in: 3600,
							scope: "mcp",
							message:
								"This server uses Bearer token authentication. The access token is for OAuth compatibility only. Please provide your Superthread PAT in the Authorization header.",
						}),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// For other grant types, return error
				return new Response(
					JSON.stringify({
						error: "unsupported_grant_type",
						error_description: `Grant type "${grantType}" is not supported. This server uses Bearer token authentication. Please provide your Superthread PAT in the Authorization header as: Bearer stp-xxx`,
					}),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				);
			} catch (error) {
				console.error("Token endpoint error:", error);
				return new Response(
					JSON.stringify({
						error: "invalid_request",
						error_description: "Failed to parse request body",
					}),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
		}

		// Handle dynamic client registration endpoint
		if (request.method === "POST" && pathname === "/register") {
			return new Response(
				JSON.stringify({
					client_id: "bearer-token-client",
					client_secret: "",
					redirect_uris: [],
					registration_access_token: null,
					registration_client_uri: null,
					client_id_issued_at: Math.floor(Date.now() / 1000),
					client_secret_expires_at: 0,
					// Indicate Bearer token authentication
					auth_method: "bearer_token",
					message:
						"This server uses Bearer token authentication. Provide your Superthread PAT in the Authorization header.",
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Health check endpoint
		if (request.method === "GET" && pathname === "/health") {
			return new Response(
				JSON.stringify({
					status: "ok",
					timestamp: new Date().toISOString(),
					service: "superthread-mcp-extended",
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Only handle POST requests to /mcp/app endpoint
		if (request.method !== "POST" || pathname !== "/mcp/app") {
			return new Response("Not Found", { status: 404 });
		}

		// Extract Bearer token from Authorization header
		const authToken = extractBearerToken(request);
		if (!authToken) {
			const authHeader = request.headers.get("Authorization");
			const allHeaders = Object.fromEntries(request.headers.entries());

			// Debug: Log all headers to help diagnose the issue
			console.log("MCP Request Headers:", JSON.stringify(allHeaders, null, 2));

			const debugInfo = authHeader
				? `Received: "${authHeader.substring(0, 50)}..."`
				: "No Authorization header found";

			// More helpful error message for Claude Code users
			return createErrorResponse(
				-32600,
				`Missing or invalid Authorization header. Expected: Bearer stp-xxx. ${debugInfo}

Note: This server requires Bearer token authentication. If you're using Claude Code, make sure your MCP server configuration includes the Authorization header with your Superthread PAT:
{
  "type": "http",
  "url": "http://127.0.0.1:8787/mcp/app",
  "headers": {
    "Authorization": "Bearer stp-xxxxx"
  }
}

If you see this error, Claude Code may be using OAuth flow instead of Bearer token. Try disabling the MCP server and re-adding it, or check Claude Code settings to disable OAuth for this server.`,
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
