// Import all tool functions directly
import {
	get_my_account,
	update_my_account,
	get_team_members,
	update_team_member,
} from "./tools/user.js";
import {
	createCard,
	getCard,
	updateCard,
	deleteCard,
	duplicateCard,
	getCardsAssignedToUser,
	addRelatedCard,
	archiveCard,
} from "./tools/cards.js";
import {
	getProject,
	listProjects,
	createProject,
	updateProject,
	getProjects,
	addRelatedCardToProject,
	archiveProject,
} from "./tools/projects.js";
import {
	create_board,
	get_board,
	get_boards,
	update_board,
	delete_board,
	duplicate_board,
} from "./tools/boards.js";
import { get_tags, add_tags_to_card } from "./tools/tags.js";
import {
	create_comment,
	edit_comment,
	get_comment,
	get_all_replies_to_comment,
	reply_to_comment,
	edit_reply,
} from "./tools/comments.js";
import { create_note, get_note, get_notes } from "./tools/notes.js";
import {
	create_page,
	update_page,
	get_page,
	duplicate_page,
	get_pages,
	archive_page,
} from "./tools/pages.js";
import {
	create_space,
	update_space,
	get_space,
	get_spaces,
	add_member_to_space,
} from "./tools/spaces.js";
import { create_list, update_list } from "./tools/lists.js";
import { get_search_results } from "./tools/search.js";

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
								// User Management Tools
								{
									name: "get_my_account",
									description: "Get current user information",
									inputSchema: { type: "object", properties: {} },
								},
								{
									name: "update_my_account",
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
									name: "get_team_members",
									description: "Get team members",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
										},
										required: ["team_id"],
									},
								},
								{
									name: "update_team_member",
									description: "Update team member role",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											user_id: { type: "string", description: "User ID" },
											role: {
												type: "string",
												enum: ["admin", "member", "viewer"],
												description: "Role",
											},
										},
										required: ["team_id", "user_id"],
									},
								},
								// Card Management Tools
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
											project_id: { type: "string", description: "Project ID" },
											board_id: { type: "string", description: "Board ID" },
										},
										required: ["title", "team_id", "list_id", "project_id"],
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
									name: "duplicate_card",
									description: "Duplicate a card",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
											title: {
												type: "string",
												description: "Title for duplicated card",
											},
										},
										required: ["team_id", "card_id"],
									},
								},
								{
									name: "get_cards_assigned_to_user",
									description: "Get cards assigned to a user",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											user_id: { type: "string", description: "User ID" },
											project_id: { type: "string", description: "Project ID" },
										},
										required: ["team_id", "user_id"],
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
								// Project Management Tools
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
											project_id: { type: "string", description: "Project ID" },
										},
										required: ["project_id"],
									},
								},
								{
									name: "create_project",
									description: "Create a new project",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											name: { type: "string", description: "Project name" },
											description: {
												type: "string",
												description: "Project description",
											},
											color: { type: "string", description: "Project color" },
										},
										required: ["team_id", "name"],
									},
								},
								{
									name: "update_project",
									description: "Update a project",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											project_id: { type: "string", description: "Project ID" },
											name: { type: "string", description: "Project name" },
											description: {
												type: "string",
												description: "Project description",
											},
											color: { type: "string", description: "Project color" },
										},
										required: ["team_id", "project_id"],
									},
								},
								{
									name: "get_projects",
									description: "Get projects for a team",
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
									name: "add_related_card_to_project",
									description: "Add related card to project",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											project_id: { type: "string", description: "Project ID" },
											card_id: { type: "string", description: "Card ID" },
										},
										required: ["team_id", "project_id", "card_id"],
									},
								},
								{
									name: "archive_project",
									description: "Archive a project",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											project_id: { type: "string", description: "Project ID" },
										},
										required: ["team_id", "project_id"],
									},
								},
								// Board Management Tools
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
										required: ["title", "team_id", "project_id"],
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
									name: "get_boards",
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
								{
									name: "duplicate_board",
									description: "Duplicate a board",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											board_id: { type: "string", description: "Board ID" },
											title: {
												type: "string",
												description: "Title for duplicated board",
											},
											project_id: {
												type: "string",
												description: "Project ID for duplicated board",
											},
										},
										required: ["team_id", "board_id"],
									},
								},
								// Tag Management Tools
								{
									name: "get_tags",
									description: "Get tags for a team",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											project_id: { type: "string", description: "Project ID" },
										},
										required: ["team_id"],
									},
								},
								{
									name: "add_tags_to_card",
									description: "Add tags to a card",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
											tag_ids: {
												type: "array",
												items: { type: "string" },
												description: "Tag IDs",
											},
										},
										required: ["team_id", "card_id", "tag_ids"],
									},
								},
								// Comment Management Tools
								{
									name: "create_comment",
									description: "Create a comment",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											card_id: { type: "string", description: "Card ID" },
											page_id: { type: "string", description: "Page ID" },
											content: {
												type: "string",
												description: "Comment content",
											},
										},
										required: ["team_id", "content"],
									},
								},
								{
									name: "edit_comment",
									description: "Edit a comment",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											comment_id: { type: "string", description: "Comment ID" },
											content: {
												type: "string",
												description: "Updated content",
											},
										},
										required: ["team_id", "comment_id", "content"],
									},
								},
								{
									name: "get_comment",
									description: "Get a comment",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											comment_id: { type: "string", description: "Comment ID" },
										},
										required: ["team_id", "comment_id"],
									},
								},
								{
									name: "get_all_replies_to_comment",
									description: "Get all replies to a comment",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											comment_id: { type: "string", description: "Comment ID" },
										},
										required: ["team_id", "comment_id"],
									},
								},
								{
									name: "reply_to_comment",
									description: "Reply to a comment",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											comment_id: { type: "string", description: "Comment ID" },
											content: { type: "string", description: "Reply content" },
										},
										required: ["team_id", "comment_id", "content"],
									},
								},
								{
									name: "edit_reply",
									description: "Edit a reply",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											reply_id: { type: "string", description: "Reply ID" },
											content: {
												type: "string",
												description: "Updated content",
											},
										},
										required: ["team_id", "reply_id", "content"],
									},
								},
								// Note Management Tools
								{
									name: "create_note",
									description: "Create a note",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											title: { type: "string", description: "Note title" },
											content: { type: "string", description: "Note content" },
											project_id: { type: "string", description: "Project ID" },
										},
										required: ["team_id", "title"],
									},
								},
								{
									name: "get_note",
									description: "Get a note",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											note_id: { type: "string", description: "Note ID" },
										},
										required: ["team_id", "note_id"],
									},
								},
								{
									name: "get_notes",
									description: "Get notes",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											project_id: { type: "string", description: "Project ID" },
											cursor: {
												type: "string",
												description: "Pagination cursor",
											},
										},
										required: ["team_id"],
									},
								},
								// Page Management Tools
								{
									name: "create_page",
									description: "Create a page",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											title: { type: "string", description: "Page title" },
											content: { type: "string", description: "Page content" },
											project_id: { type: "string", description: "Project ID" },
											parent_page_id: {
												type: "string",
												description: "Parent page ID",
											},
										},
										required: ["team_id", "title"],
									},
								},
								{
									name: "update_page",
									description: "Update a page",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											page_id: { type: "string", description: "Page ID" },
											title: { type: "string", description: "Page title" },
											content: { type: "string", description: "Page content" },
										},
										required: ["team_id", "page_id"],
									},
								},
								{
									name: "get_page",
									description: "Get a page",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											page_id: { type: "string", description: "Page ID" },
										},
										required: ["team_id", "page_id"],
									},
								},
								{
									name: "duplicate_page",
									description: "Duplicate a page",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											page_id: { type: "string", description: "Page ID" },
											title: {
												type: "string",
												description: "Title for duplicated page",
											},
										},
										required: ["team_id", "page_id"],
									},
								},
								{
									name: "get_pages",
									description: "Get pages",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											project_id: { type: "string", description: "Project ID" },
											cursor: {
												type: "string",
												description: "Pagination cursor",
											},
										},
										required: ["team_id"],
									},
								},
								{
									name: "archive_page",
									description: "Archive a page",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											page_id: { type: "string", description: "Page ID" },
										},
										required: ["team_id", "page_id"],
									},
								},
								// Space Management Tools
								{
									name: "create_space",
									description: "Create a space",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											name: { type: "string", description: "Space name" },
											description: {
												type: "string",
												description: "Space description",
											},
											privacy: {
												type: "string",
												enum: ["public", "private"],
												description: "Privacy setting",
											},
										},
										required: ["team_id", "name"],
									},
								},
								{
									name: "update_space",
									description: "Update a space",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											space_id: { type: "string", description: "Space ID" },
											name: { type: "string", description: "Space name" },
											description: {
												type: "string",
												description: "Space description",
											},
											privacy: {
												type: "string",
												enum: ["public", "private"],
												description: "Privacy setting",
											},
										},
										required: ["team_id", "space_id"],
									},
								},
								{
									name: "get_space",
									description: "Get a space",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											space_id: { type: "string", description: "Space ID" },
										},
										required: ["team_id", "space_id"],
									},
								},
								{
									name: "get_spaces",
									description: "Get spaces",
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
									name: "add_member_to_space",
									description: "Add member to space",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											space_id: { type: "string", description: "Space ID" },
											user_id: { type: "string", description: "User ID" },
											role: {
												type: "string",
												enum: ["admin", "member", "viewer"],
												description: "Role",
											},
										},
										required: ["team_id", "space_id", "user_id"],
									},
								},
								// List Management Tools
								{
									name: "create_list",
									description: "Create a list",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											board_id: { type: "string", description: "Board ID" },
											title: { type: "string", description: "List title" },
											behavior: {
												type: "string",
												enum: ["backlog", "active", "done", "custom"],
												description: "List behavior",
											},
											color: { type: "string", description: "List color" },
											position: {
												type: "number",
												description: "List position",
											},
										},
										required: ["team_id", "board_id", "title"],
									},
								},
								{
									name: "update_list",
									description: "Update a list",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											list_id: { type: "string", description: "List ID" },
											title: { type: "string", description: "List title" },
											behavior: {
												type: "string",
												enum: ["backlog", "active", "done", "custom"],
												description: "List behavior",
											},
											color: { type: "string", description: "List color" },
											position: {
												type: "number",
												description: "List position",
											},
										},
										required: ["team_id", "list_id"],
									},
								},
								// Search Tools
								{
									name: "get_search_results",
									description: "Search across different content types",
									inputSchema: {
										type: "object",
										properties: {
											team_id: { type: "string", description: "Team ID" },
											query: { type: "string", description: "Search query" },
											type: {
												type: "string",
												enum: ["cards", "projects", "notes", "pages", "all"],
												description: "Content type filter",
											},
											project_id: {
												type: "string",
												description: "Project ID filter",
											},
											limit: { type: "number", description: "Result limit" },
											cursor: {
												type: "string",
												description: "Pagination cursor",
											},
										},
										required: ["team_id", "query"],
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
							// User Management
							case "get_my_account":
								toolResult = await get_my_account(toolArgs, authToken);
								break;
							case "update_my_account":
								toolResult = await update_my_account(toolArgs, authToken);
								break;
							case "get_team_members":
								toolResult = await get_team_members(toolArgs, authToken);
								break;
							case "update_team_member":
								toolResult = await update_team_member(toolArgs, authToken);
								break;
							// Card Management
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
							case "duplicate_card":
								toolResult = await duplicateCard(toolArgs, authToken);
								break;
							case "get_cards_assigned_to_user":
								toolResult = await getCardsAssignedToUser(toolArgs, authToken);
								break;
							case "add_related_card":
								toolResult = await addRelatedCard(toolArgs, authToken);
								break;
							case "archive_card":
								toolResult = await archiveCard(toolArgs, authToken);
								break;
							// Project Management
							case "list_projects":
								toolResult = await listProjects(toolArgs, authToken);
								break;
							case "get_project":
								toolResult = await getProject(toolArgs, authToken);
								break;
							case "create_project":
								toolResult = await createProject(toolArgs, authToken);
								break;
							case "update_project":
								toolResult = await updateProject(toolArgs, authToken);
								break;
							case "get_projects":
								toolResult = await getProjects(toolArgs, authToken);
								break;
							case "add_related_card_to_project":
								toolResult = await addRelatedCardToProject(toolArgs, authToken);
								break;
							case "archive_project":
								toolResult = await archiveProject(toolArgs, authToken);
								break;
							// Board Management
							case "create_board":
								toolResult = await create_board(toolArgs, authToken);
								break;
							case "get_board":
								toolResult = await get_board(toolArgs, authToken);
								break;
							case "get_boards":
								toolResult = await get_boards(toolArgs, authToken);
								break;
							case "update_board":
								toolResult = await update_board(toolArgs, authToken);
								break;
							case "delete_board":
								toolResult = await delete_board(toolArgs, authToken);
								break;
							case "duplicate_board":
								toolResult = await duplicate_board(toolArgs, authToken);
								break;
							// Tag Management
							case "get_tags":
								toolResult = await get_tags(toolArgs, authToken);
								break;
							case "add_tags_to_card":
								toolResult = await add_tags_to_card(toolArgs, authToken);
								break;
							// Comment Management
							case "create_comment":
								toolResult = await create_comment(toolArgs, authToken);
								break;
							case "edit_comment":
								toolResult = await edit_comment(toolArgs, authToken);
								break;
							case "get_comment":
								toolResult = await get_comment(toolArgs, authToken);
								break;
							case "get_all_replies_to_comment":
								toolResult = await get_all_replies_to_comment(
									toolArgs,
									authToken,
								);
								break;
							case "reply_to_comment":
								toolResult = await reply_to_comment(toolArgs, authToken);
								break;
							case "edit_reply":
								toolResult = await edit_reply(toolArgs, authToken);
								break;
							// Note Management
							case "create_note":
								toolResult = await create_note(toolArgs, authToken);
								break;
							case "get_note":
								toolResult = await get_note(toolArgs, authToken);
								break;
							case "get_notes":
								toolResult = await get_notes(toolArgs, authToken);
								break;
							// Page Management
							case "create_page":
								toolResult = await create_page(toolArgs, authToken);
								break;
							case "update_page":
								toolResult = await update_page(toolArgs, authToken);
								break;
							case "get_page":
								toolResult = await get_page(toolArgs, authToken);
								break;
							case "duplicate_page":
								toolResult = await duplicate_page(toolArgs, authToken);
								break;
							case "get_pages":
								toolResult = await get_pages(toolArgs, authToken);
								break;
							case "archive_page":
								toolResult = await archive_page(toolArgs, authToken);
								break;
							// Space Management
							case "create_space":
								toolResult = await create_space(toolArgs, authToken);
								break;
							case "update_space":
								toolResult = await update_space(toolArgs, authToken);
								break;
							case "get_space":
								toolResult = await get_space(toolArgs, authToken);
								break;
							case "get_spaces":
								toolResult = await get_spaces(toolArgs, authToken);
								break;
							case "add_member_to_space":
								toolResult = await add_member_to_space(toolArgs, authToken);
								break;
							// List Management
							case "create_list":
								toolResult = await create_list(toolArgs, authToken);
								break;
							case "update_list":
								toolResult = await update_list(toolArgs, authToken);
								break;
							// Search
							case "get_search_results":
								toolResult = await get_search_results(toolArgs, authToken);
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
