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
	list_id: z.string().optional().describe("New list ID"),
	project_id: z.string().optional().describe("New project ID"),
	sprint_id: z.string().optional().describe("New sprint ID"),
	owner_id: z.string().optional().describe("New owner user ID"),
	start_date: z
		.number()
		.optional()
		.describe("New start date as Unix timestamp"),
	due_date: z.number().optional().describe("New due date as Unix timestamp"),
	position: z.number().optional().describe("New position in list"),
	priority: z.number().optional().describe("New priority level (numeric)"),
	estimate: z.number().optional().describe("New estimate in story points"),
	archived: z.boolean().optional().describe("Archive/unarchive the card"),
	content: z.string().optional().describe("New card description"),
});

export const deleteCardSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("The unique identifier for the card to delete"),
});

export const duplicateCardSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("Card ID to duplicate"),
	title: z.string().optional().describe("Title for duplicated card"),
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

	return apiClient.makeRequest(`/${team_id}/cards`, token, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function getCard(
	args: z.infer<typeof getCardSchema>,
	token: string,
) {
	const { team_id, card_id } = args;
	return apiClient.makeRequest(`/${team_id}/cards/${card_id}`, token);
}

export async function updateCard(
	args: z.infer<typeof updateCardSchema>,
	token: string,
) {
	const { team_id, card_id, ...payload } = args;
	if (Object.keys(payload).length === 0) {
		throw new Error("No fields to update were provided.");
	}
	return apiClient.makeRequest(`/${team_id}/cards/${card_id}`, token, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}

export async function deleteCard(
	args: z.infer<typeof deleteCardSchema>,
	token: string,
) {
	const { team_id, card_id } = args;
	await apiClient.makeRequest(`/${team_id}/cards/${card_id}`, token, {
		method: "DELETE",
	});
	return { success: true, message: "Card deleted successfully." };
}

export async function duplicateCard(
	args: z.infer<typeof duplicateCardSchema>,
	token: string,
) {
	const { team_id, card_id, ...payload } = args;
	return apiClient.makeRequest(
		`/${team_id}/cards/${card_id}/duplicate`,
		token,
		{
			method: "POST",
			body: JSON.stringify(payload),
		},
	);
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
		"delete_card",
		{
			title: "Delete a card",
			description: "Deletes a specific card by its ID.",
			inputSchema: deleteCardSchema.shape,
		},
		(args) => handleToolExecution(() => deleteCard(args as any, authToken)),
	);

	server.registerTool(
		"duplicate_card",
		{
			title: "Duplicate a card",
			description: "Creates a duplicate of an existing card.",
			inputSchema: duplicateCardSchema.shape,
		},
		(args) => handleToolExecution(() => duplicateCard(args as any, authToken)),
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
}
