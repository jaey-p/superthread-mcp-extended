import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { search } from "../lib/search.js";
import { getUserFromToken, getUserTeams } from "./user.js";
import { apiClient } from "../lib/api-client.js";
import type { Card } from "../types/cards.js";
import type { CardSearchResult } from "../types/search.js";

export const createCardSchema = {
	team_id: z
		.string()
		.describe(
			"Use the get_me tool first to get the team IDs available. If needed, confirm with the user which team they want to use.",
		),
	title: z.string().describe("Card title"),
	list_id: z.string().describe("List ID where the card will be placed"),
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
	project_id: z.string().optional().describe("Project ID"),
	owner_id: z.string().optional().describe("Owner user ID"),
	priority: z.string().optional().describe("Priority level"),
	estimate: z.number().optional().describe("Estimate in story points"),
	start_date: z.number().optional().describe("Start date as Unix timestamp"),
	due_date: z.number().optional().describe("Due date as Unix timestamp"),
	parent_card_id: z.string().optional().describe("Parent card ID"),
	epic_id: z.string().optional().describe("Epic ID"),
};

export async function createCard(args: any, token: string) {
	const startTime = Date.now();

	console.log(
		JSON.stringify({
			event: "tool_call_start",
			tool_name: "create_card",
			timestamp: new Date().toISOString(),
		}),
	);

	try {
		const typedArgs = args as z.infer<z.ZodObject<typeof createCardSchema>>;
		const { team_id, board_id, sprint_id, list_id, ...cardData } = typedArgs;

		if (!board_id && !sprint_id) {
			throw new Error("Either board_id or sprint_id must be provided");
		}

		const payload = {
			...cardData,
			list_id,
			...(board_id && { board_id }),
			...(sprint_id && { sprint_id }),
		};

		console.log("CREATE_CARD_PAYLOAD:", JSON.stringify(payload, null, 2));

		const card = await apiClient.makeRequest(`/${team_id}/cards`, token, {
			method: "POST",
			body: JSON.stringify(payload),
		});

		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_success",
				tool_name: "create_card",
				duration_ms,
				team_id,
				card_id: card?.id,
				status: "success",
				timestamp: new Date().toISOString(),
			}),
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(card, null, 2),
				},
			],
		};
	} catch (error) {
		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_error",
				tool_name: "create_card",
				duration_ms,
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			}),
		);

		throw error;
	}
}

export const getCardSchema = {
	query: z
		.string()
		.describe(
			"Card title or identifier to search for. If the identifier contains a prefix (eg. ENG-123), remove the prefix and search by ID",
		),
};

/**
 * Fetches detailed information about a specific card by its title or ID (minus the prefix)
 */
export async function getCard(args: any, token: string) {
	const startTime = Date.now();

	console.log(
		JSON.stringify({
			event: "tool_call_start",
			tool_name: "get_card",
			timestamp: new Date().toISOString(),
		}),
	);

	try {
		const { query } = args as z.infer<z.ZodObject<typeof getCardSchema>>;

		const user = await getUserFromToken(token);
		const teamIds = await getUserTeams(user);

		// The list of cards returned. Ideally, this should be one card. But
		// the search may return multiple cards if the user has access to multiple teams.
		const allCards: Card[] = [];

		// Declare a tuple of card search result and team ID
		const seenCards: [CardSearchResult, string][] = [];

		for (const teamId of teamIds) {
			try {
				const searchResults = await search(teamId, token, {
					query,
					types: ["cards"],
				});

				if (searchResults.cards) {
					for (const card of searchResults.cards) {
						if (!seenCards.find((c) => c[0].id === card.id)) {
							seenCards.push([card, teamId]);
						}
					}
				}
			} catch (error) {
				console.error(`Error fetching cards IDs for team ${teamId}:`, error);
				throw new Error(
					`Error fetching cards IDs for team ${teamId}: ${error}`,
				);
			}
		}

		if (!seenCards.length) {
			throw new Error("No cards found");
		}

		for (const [seenCard, teamId] of seenCards) {
			const card = await apiClient.makeRequest(
				`/${teamId}/cards/${seenCard.id}`,
				token,
			);
			allCards.push(card);
		}

		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_success",
				tool_name: "get_card",
				duration_ms,
				user_id: user?.user?.id,
				cards_found: allCards.length,
				status: "success",
				timestamp: new Date().toISOString(),
			}),
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(allCards, null, 2),
				},
			],
		};
	} catch (error) {
		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_error",
				tool_name: "get_card",
				duration_ms,
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			}),
		);

		throw error;
	}
}

export const updateCardSchema = {
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("Use the get_card tool to retrieve the card ID"),
	title: z.string().optional().describe("Card title"),
	board_id: z.string().optional().describe("Board ID"),
	list_id: z.string().optional().describe("List ID"),
	project_id: z.string().optional().describe("Project ID"),
	sprint_id: z.string().optional().describe("Sprint ID"),
	owner_id: z.string().optional().describe("Owner user ID"),
	start_date: z.number().optional().describe("Start date as Unix timestamp"),
	due_date: z.number().optional().describe("Due date as Unix timestamp"),
	position: z.number().optional().describe("Position in list"),
	priority: z.string().optional().describe("Priority level"),
	estimate: z.number().optional().describe("Estimate in story points"),
	archived: z.boolean().optional().describe("Archive/unarchive the card"),
};

export async function updateCard(args: any, token: string) {
	const startTime = Date.now();

	console.log(
		JSON.stringify({
			event: "tool_call_start",
			tool_name: "update_card",
			timestamp: new Date().toISOString(),
		}),
	);

	try {
		const typedArgs = args as z.infer<z.ZodObject<typeof updateCardSchema>>;
		const { team_id, card_id, ...updateData } = typedArgs;

		const card = await apiClient.makeRequest(
			`/${team_id}/cards/${card_id}`,
			token,
			{
				method: "PATCH",
				body: JSON.stringify(updateData),
			},
		);

		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_success",
				tool_name: "update_card",
				duration_ms,
				team_id,
				card_id,
				status: "success",
				timestamp: new Date().toISOString(),
			}),
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(card, null, 2),
				},
			],
		};
	} catch (error) {
		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_error",
				tool_name: "update_card",
				duration_ms,
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			}),
		);

		throw error;
	}
}

export const deleteCardSchema = {
	team_id: z.string().describe("Team/workspace ID"),
	card_id: z.string().describe("Use the get_card tool to retrieve the card ID"),
};

export async function deleteCard(args: any, token: string) {
	const startTime = Date.now();

	console.log(
		JSON.stringify({
			event: "tool_call_start",
			tool_name: "delete_card",
			timestamp: new Date().toISOString(),
		}),
	);

	try {
		const { team_id, card_id } = args as z.infer<
			z.ZodObject<typeof deleteCardSchema>
		>;
		await apiClient.makeRequest(`/${team_id}/cards/${card_id}`, token, {
			method: "DELETE",
		});

		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_success",
				tool_name: "delete_card",
				duration_ms,
				team_id,
				card_id,
				status: "success",
				timestamp: new Date().toISOString(),
			}),
		);

		return {
			content: [
				{
					type: "text" as const,
					text: "Card deleted successfully",
				},
			],
		};
	} catch (error) {
		const duration_ms = Date.now() - startTime;

		console.log(
			JSON.stringify({
				event: "tool_call_error",
				tool_name: "delete_card",
				duration_ms,
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			}),
		);

		throw error;
	}
}

export function registerCardTools(server: McpServer, authToken: string) {
	server.registerTool(
		"create_card",
		{
			title: "Create a new card",
			description:
				"Create a new card in a specified team and board. Ask the user which team and board the card should be created in",
			inputSchema: createCardSchema,
		},
		(args) => createCard(args, authToken),
	);

	server.registerTool(
		"get_card",
		{
			title:
				"Get detailed information about a specific card by its title or ID (minus the prefix)",
			description:
				"Fetches detailed information about a specific card by its title or ID (minus the prefix)",
			inputSchema: getCardSchema,
		},
		(args) => getCard(args, authToken),
	);

	server.registerTool(
		"update_card",
		{
			title: "Update a card's attributes or archive/unarchive it",
			description: "Update a card's attributes or archive/unarchive it",
			inputSchema: updateCardSchema,
		},
		(args) => updateCard(args, authToken),
	);

	server.registerTool(
		"delete_card",
		{
			title: "Deletes a specific card",
			description:
				"Deletes a specific card, identified by its card_id, within the specified workspace (team_id)",
			inputSchema: deleteCardSchema,
		},
		(args) => deleteCard(args, authToken),
	);
}
