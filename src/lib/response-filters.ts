/**
 * Response filtering utilities to minimize token usage and reduce payload size.
 * Filters out heavy/verbose fields while keeping essential data for core workflows.
 */

// Types for filtered responses
export interface FilteredUserAccount {
	user_id: string;
	team_id: string;
	team_name: string;
	role: string;
}

export interface FilteredBoard {
	id: string;
	title: string;
}

export interface FilteredSpace {
	id: string;
	title: string;
	description?: string;
	boards: FilteredBoard[];
}

export interface FilteredSpacesResponse {
	spaces: FilteredSpace[];
}

export interface FilteredCard {
	id: string;
	title: string;
	content?: string;
	status: string;
	priority?: number;
	estimate?: number;
	owner_id?: string;
	list_id: string;
	board_id: string;
	project_id: string;
	sprint_id?: string;
	archived?: {
		user_id: string;
		time_archived: number;
	};
	parent_card?: {
		title: string;
		card_id: string;
		list_color: string;
		status: string;
	};
	epic?: {
		id: string;
		title: string;
	};
}

export interface FilteredList {
	id: string;
	title: string;
	behavior: string;
	cards: FilteredCard[];
}

export interface FilteredBoardDetails {
	id: string;
	title: string;
	lists: FilteredList[];
}

export interface FilteredBoardResponse {
	board: FilteredBoardDetails;
}

/**
 * Heavy/verbose fields to filter out from API responses.
 * These fields contribute significantly to response size but aren't needed for core workflows.
 */
const HEAVY_FIELDS = [
	// Timestamps
	"time_created",
	"time_updated",
	"start_date",
	"due_date",
	"completed_date",
	"created_at",
	"updated_at",

	// User objects (OAuth details)
	"user",
	"user_updated",
	"created_by",
	"updated_by",

	// Arrays (can be large)
	"members",
	"checklists",
	"child_cards",
	"linked_cards",
	"tags",
	"attachments",

	// Metadata
	"external_links",
	"hints",
	"collaboration",
	"permissions",
	"settings",

	// Media (base64 data)
	"icon",
	"cover_image",
	"avatar",
];

/**
 * Recursively removes heavy fields from an object or array.
 */
function stripHeavyFields(obj: any): any {
	if (Array.isArray(obj)) {
		return obj.map(stripHeavyFields);
	}

	if (obj && typeof obj === "object") {
		const filtered: any = {};
		for (const [key, value] of Object.entries(obj)) {
			if (!HEAVY_FIELDS.includes(key)) {
				filtered[key] = stripHeavyFields(value);
			}
		}
		return filtered;
	}

	return obj;
}

/**
 * Filters get_my_account response to essential fields only.
 * Reduces from ~2KB to ~100 bytes.
 */
export function filterUserAccount(response: any): FilteredUserAccount {
	// Handle both direct user object and wrapped response
	const user = response.user || response;

	// Extract team info from teams array if available
	const teams = user.teams || [];
	const primaryTeam = teams[0] || {};

	return {
		user_id: user.id || user.user_id,
		team_id: primaryTeam.id || user.team_id,
		team_name: primaryTeam.name || user.team_name || "Unknown Team",
		role: primaryTeam.role || user.role || "member",
	};
}

/**
 * Filters get_spaces response to essential workspace structure.
 * Keeps only id, title, and nested boards for workspace navigation.
 */
export function filterSpaces(response: any): FilteredSpacesResponse {
	// Handle pagination wrapper if present
	const projects = response.projects || response.data || response;

	if (!Array.isArray(projects)) {
		throw new Error("Invalid spaces response format");
	}

	const filteredSpaces: FilteredSpace[] = projects.map((project: any) => ({
		id: project.id,
		title: project.title || project.name,
		description: project.description,
		boards: (project.boards || []).map((board: any) => ({
			id: board.id,
			title: board.title || board.name,
		})),
	}));

	return {
		spaces: filteredSpaces,
	};
}

/**
 * Filters get_board response to essential board structure.
 * Keeps board info, lists, and cards with essential fields only.
 */
export function filterBoard(response: any): FilteredBoardResponse {
	// Handle wrapped response
	const board = response.board || response;

	if (!board) {
		throw new Error("Invalid board response format");
	}

	const filteredBoard: FilteredBoardDetails = {
		id: board.id,
		title: board.title || board.name,
		lists: (board.lists || []).map((list: any) => ({
			id: list.id,
			title: list.title || list.name,
			behavior: list.behavior || "active",
			cards: (list.cards || []).map((card: any) => ({
				id: card.id,
				title: card.title,
				content: card.content,
				status: card.status,
				priority: card.priority,
				estimate: card.estimate,
				owner_id: card.owner_id,
				list_id: card.list_id,
				board_id: card.board_id,
				project_id: card.project_id,
				sprint_id: card.sprint_id,
				archived: card.archived,
				parent_card: card.parent_card,
				epic: card.epic
					? {
							id: card.epic.id,
							title: card.epic.title,
						}
					: undefined,
			})),
		})),
	};

	return {
		board: filteredBoard,
	};
}

/**
 * Generic filter that removes heavy fields while preserving structure.
 * Use this for responses that don't have specific filter functions.
 */
export function filterGenericResponse(response: unknown): unknown {
	return stripHeavyFields(response);
}

/**
 * Utility to estimate response size reduction.
 */
export function getResponseSizeReduction(
	original: any,
	filtered: any,
): {
	originalSize: number;
	filteredSize: number;
	reductionPercent: number;
} {
	const originalSize = JSON.stringify(original).length;
	const filteredSize = JSON.stringify(filtered).length;
	const reductionPercent = Math.round(
		((originalSize - filteredSize) / originalSize) * 100,
	);

	return {
		originalSize,
		filteredSize,
		reductionPercent,
	};
}
