import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

export const createCardSchema = z.object({
	team_id: z
		.string()
		.describe(
			"Use the get_me tool first to get the team IDs available. If needed, confirm with the user which team they want to use.",
		),
	title: z.string().describe("Card title"),
	list_id: z.string().describe("List ID where the card will be placed"),
	project_id: z.string().describe("Project ID the card belongs to"),
	board_id: z
		.string()
		.optional()
		.describe(
			"Board ID (required if sprint_id not provided). Use get_board tool to get the board ID from a board name",
		),
	sprint_id: z
		.string()
		.optional()
		.describe("Sprint ID (required if board_id not provided)"),
	content: z.string().optional().describe("Card description"),
	owner_id: z.string().optional().describe("Owner user ID"),
	priority: z.number().optional().describe("Priority level (numeric)"),
	estimate: z.number().optional().describe("Estimate in story points"),
	start_date: z.number().optional().describe("Start date as Unix timestamp"),
	due_date: z.number().optional().describe("Due date as Unix timestamp"),
	parent_card_id: z.string().optional().describe("Parent card ID"),
	epic_id: z.string().optional().describe("Epic ID"),
	tag_ids: z
		.array(z.string())
		.optional()
		.describe("Array of tag IDs to add to the card"),
	tag_names: z
		.array(z.string())
		.optional()
		.describe("Array of tag names to add to the card"),
});

export const getCardSchema = z.object({
	team_id: z.string().describe("Team/workspace ID where the card is located"),
	card_id: z.string().describe("The unique identifier for the card"),
});

export const updateCardSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("The unique identifier for the card to update"),
	title: z.string().optional().describe("New card title"),
	board_id: z.string().optional().describe("New board ID"),
	list_id: z
		.string()
		.optional()
		.describe(
			"New list ID. Changing this moves the card to a different list (work status). Use with position to set the card's position in the new list.",
		),
	project_id: z.string().optional().describe("New project ID"),
	sprint_id: z.string().optional().describe("New sprint ID"),
	owner_id: z.string().optional().describe("New owner user ID"),
	start_date: z
		.number()
		.optional()
		.describe("New start date as Unix timestamp"),
	due_date: z.number().optional().describe("New due date as Unix timestamp"),
	position: z
		.number()
		.optional()
		.describe(
			"New position in list (0-based index). Use with list_id to move card to a different list and set its position.",
		),
	priority: z.number().optional().describe("New priority level (numeric)"),
	estimate: z.number().optional().describe("New estimate in story points"),
	archived: z.boolean().optional().describe("Archive/unarchive the card"),
	content: z.string().optional().describe("New card description"),
	tag_ids: z
		.array(z.string())
		.optional()
		.describe("Array of tag IDs to add to the card. Replaces existing tags if provided."),
	tag_names: z
		.array(z.string())
		.optional()
		.describe("Array of tag names to add to the card. Replaces existing tags if provided."),
});

export const getCardsAssignedToUserSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	user_id: z.string().describe("User ID to get assigned cards for"),
	project_id: z.string().optional().describe("Filter by project ID"),
});

export const addRelatedCardSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("Card ID to add relation to"),
	related_card_id: z.string().describe("Related card ID"),
	relation_type: z
		.enum(["blocks", "blocked_by", "relates_to"])
		.describe("Type of relationship"),
});

export const archiveCardSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("Card ID to archive"),
});

export const addCardMemberSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("Card ID to add member to"),
	user_id: z.string().describe("User ID to add as member"),
	role: z
		.enum(["member", "admin", "viewer"])
		.optional()
		.default("member")
		.describe("Member role (default: member)"),
});

export const removeCardMemberSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("Card ID to remove member from"),
	user_id: z.string().describe("User ID to remove"),
});

export const addCardTagSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("Card ID to add tag to"),
	tag_id: z.string().describe("Tag ID to add"),
});

export const removeCardTagSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("Card ID to remove tag from"),
	tag_id: z.string().describe("Tag ID to remove"),
});

async function handleToolExecution(toolFn: (...args: any[]) => Promise<any>) {
	const result = await toolFn();
	if (typeof result === "object" && result !== null) {
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	}
	return result;
}

export async function createCard(
	args: z.infer<typeof createCardSchema>,
	token: string,
) {
	const { team_id, ...payload } = args;

	if (!payload.board_id && !payload.sprint_id) {
		throw new Error("Either board_id or sprint_id must be provided.");
	}

	// Remove undefined values from payload to ensure all fields are sent
	const cleanPayload: any = Object.fromEntries(
		Object.entries(payload).filter(([_, value]) => value !== undefined),
	);

	// Convert owner_id to members array format
	// Superthread API expects members array: [{"user_id": "..."}]
	if (cleanPayload.owner_id) {
		cleanPayload.members = [{ user_id: cleanPayload.owner_id }];
		delete cleanPayload.owner_id;
	}

	// Handle tag_names or tag_ids
	// Superthread API might expect 'tags' field instead of 'tag_names'
	if (cleanPayload.tag_names && Array.isArray(cleanPayload.tag_names)) {
		// Add tags field with tag_names value
		cleanPayload.tags = cleanPayload.tag_names;
		// Also keep tag_names in case API accepts it
	} else if (cleanPayload.tag_ids && Array.isArray(cleanPayload.tag_ids)) {
		cleanPayload.tags = cleanPayload.tag_ids;
		delete cleanPayload.tag_ids;
	}

	// Debug: Log payload to help diagnose issues
	console.log("createCard payload:", JSON.stringify(cleanPayload, null, 2));

	return apiClient.makeRequest(`/${team_id}/cards`, token, {
		method: "POST",
		body: JSON.stringify(cleanPayload),
	});
}

export async function getCard(
	args: z.infer<typeof getCardSchema>,
	token: string,
) {
	const { team_id, card_id } = args;
	const result = await apiClient.makeRequest(`/${team_id}/cards/${card_id}`, token);
	console.log("getCard response:", JSON.stringify(result, null, 2));
	return result;
}

export async function updateCard(
	args: z.infer<typeof updateCardSchema>,
	token: string,
) {
	const { team_id, card_id, ...payload } = args;
	
	// Remove undefined values from payload to ensure all fields are sent
	const cleanPayload: any = Object.fromEntries(
		Object.entries(payload).filter(([_, value]) => value !== undefined),
	);
	
	// Convert owner_id to members array format
	// Superthread API expects members array: [{"user_id": "..."}]
	if (cleanPayload.owner_id) {
		cleanPayload.members = [{ user_id: cleanPayload.owner_id }];
		delete cleanPayload.owner_id;
	}
	
	// Handle tag_names or tag_ids
	// Superthread API might expect 'tags' field instead of 'tag_names'
	// Try both to see which one works
	if (cleanPayload.tag_names && Array.isArray(cleanPayload.tag_names)) {
		// Add tags field with tag_names value
		cleanPayload.tags = cleanPayload.tag_names;
		// Also keep tag_names in case API accepts it
	} else if (cleanPayload.tag_ids && Array.isArray(cleanPayload.tag_ids)) {
		cleanPayload.tags = cleanPayload.tag_ids;
		delete cleanPayload.tag_ids;
	}
	
	if (Object.keys(cleanPayload).length === 0) {
		throw new Error("No fields to update were provided.");
	}
	
	// Debug: Log payload to help diagnose issues
	console.log("updateCard payload:", JSON.stringify(cleanPayload, null, 2));
	
	return apiClient.makeRequest(`/${team_id}/cards/${card_id}`, token, {
		method: "PATCH",
		body: JSON.stringify(cleanPayload),
	});
}

export async function getCardsAssignedToUser(
	args: z.infer<typeof getCardsAssignedToUserSchema>,
	token: string,
) {
	const { team_id, user_id, project_id } = args;
	const payload = { user_id, ...(project_id && { project_id }) };
	return apiClient.makeRequest(`/${team_id}/cards/assigned`, token, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function addRelatedCard(
	args: z.infer<typeof addRelatedCardSchema>,
	token: string,
) {
	const { team_id, card_id, related_card_id, relation_type } = args;
	const payload = { related_card_id, relation_type };
	return apiClient.makeRequest(`/${team_id}/cards/${card_id}/related`, token, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function archiveCard(
	args: z.infer<typeof archiveCardSchema>,
	token: string,
) {
	const { team_id, card_id } = args;
	return apiClient.makeRequest(`/${team_id}/cards/${card_id}`, token, {
		method: "PATCH",
		body: JSON.stringify({ archived: true }),
	});
}

export async function addCardMember(
	args: z.infer<typeof addCardMemberSchema>,
	token: string,
) {
	const { team_id, card_id, user_id, role } = args;
	const payload: any = { user_id };
	if (role) {
		payload.role = role;
	}
	return apiClient.makeRequest(`/${team_id}/cards/${card_id}/members`, token, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function removeCardMember(
	args: z.infer<typeof removeCardMemberSchema>,
	token: string,
) {
	const { team_id, card_id, user_id } = args;
	return apiClient.makeRequest(
		`/${team_id}/cards/${card_id}/members/${user_id}`,
		token,
		{
			method: "DELETE",
		},
	);
}

export async function addCardTag(
	args: z.infer<typeof addCardTagSchema>,
	token: string,
) {
	const { team_id, card_id, tag_id } = args;
	return apiClient.makeRequest(`/${team_id}/cards/${card_id}/tags`, token, {
		method: "POST",
		body: JSON.stringify({ id: tag_id }),
	});
}

export async function removeCardTag(
	args: z.infer<typeof removeCardTagSchema>,
	token: string,
) {
	const { team_id, card_id, tag_id } = args;
	return apiClient.makeRequest(
		`/${team_id}/cards/${card_id}/tags/${tag_id}`,
		token,
		{
			method: "DELETE",
		},
	);
}

export function registerCardTools(server: McpServer, authToken: string) {
	server.registerTool(
		"create_card",
		{
			title: "Create a new card",
			description: "Creates a new card in a specified team, project, and list.",
			inputSchema: createCardSchema.shape,
		},
		(args) => handleToolExecution(() => createCard(args as any, authToken)),
	);

	server.registerTool(
		"get_card",
		{
			title: "Get a card by ID",
			description:
				"Fetches detailed information about a specific card using its ID.",
			inputSchema: getCardSchema.shape,
		},
		(args) => handleToolExecution(() => getCard(args as any, authToken)),
	);

	server.registerTool(
		"update_card",
		{
			title: "Update a card",
			description:
				"Updates a card's attributes. At least one field to update must be provided.",
			inputSchema: updateCardSchema.shape,
		},
		(args) => handleToolExecution(() => updateCard(args as any, authToken)),
	);

	server.registerTool(
		"get_cards_assigned_to_user",
		{
			title: "Get cards assigned to user",
			description:
				"Fetches cards assigned to a specific user, optionally filtered by project.",
			inputSchema: getCardsAssignedToUserSchema.shape,
		},
		(args) =>
			handleToolExecution(() => getCardsAssignedToUser(args as any, authToken)),
	);

	server.registerTool(
		"add_related_card",
		{
			title: "Add related card",
			description:
				"Creates a relationship between two cards (blocks, blocked by, or relates to).",
			inputSchema: addRelatedCardSchema.shape,
		},
		(args) => handleToolExecution(() => addRelatedCard(args as any, authToken)),
	);

	server.registerTool(
		"archive_card",
		{
			title: "Archive a card",
			description: "Archives a specific card by its ID.",
			inputSchema: archiveCardSchema.shape,
		},
		(args) => handleToolExecution(() => archiveCard(args as any, authToken)),
	);

	server.registerTool(
		"add_card_member",
		{
			title: "Add member to card",
			description:
				"Adds a member (assignee) to a card with optional role. Use this to assign tasks to users.",
			inputSchema: addCardMemberSchema.shape,
		},
		(args) => handleToolExecution(() => addCardMember(args as any, authToken)),
	);

	server.registerTool(
		"remove_card_member",
		{
			title: "Remove member from card",
			description: "Removes a member (assignee) from a card.",
			inputSchema: removeCardMemberSchema.shape,
		},
		(args) =>
			handleToolExecution(() => removeCardMember(args as any, authToken)),
	);
}
