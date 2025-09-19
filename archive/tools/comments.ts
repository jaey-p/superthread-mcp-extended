import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

// Schema for creating a comment
export const createCommentSchema = z.object({
	team_id: z.string().describe("Team/workspace ID (from get_my_account tool)"),
	card_id: z.string().optional().describe("Card ID to comment on"),
	page_id: z.string().optional().describe("Page ID to comment on"),
	content: z.string().describe("Comment content/text"),
});

// Schema for editing a comment
export const editCommentSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	comment_id: z.string().describe("Comment ID to edit"),
	content: z.string().describe("Updated comment content"),
});

// Schema for getting a comment
export const getCommentSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	comment_id: z.string().describe("Comment ID to retrieve"),
});

// Schema for getting all replies to a comment
export const getAllRepliesToCommentSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	comment_id: z.string().describe("Comment ID to get replies for"),
});

// Schema for replying to a comment
export const replyToCommentSchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	comment_id: z.string().describe("Comment ID to reply to"),
	content: z.string().describe("Reply content/text"),
});

// Schema for editing a reply
export const editReplySchema = z.object({
	team_id: z.string().describe("Team/workspace ID"),
	reply_id: z.string().describe("Reply ID to edit"),
	content: z.string().describe("Updated reply content"),
});

/**
 * Creates a new comment on a card or page.
 * @param args - Contains team_id, card_id/page_id, and content.
 * @param token - The authentication token.
 * @returns The created comment.
 */
export async function create_comment(
	args: z.infer<typeof createCommentSchema>,
	token: string,
) {
	// TODO: Implement create_comment API call
	// Should call: POST Create a comment
	// API endpoint: `/${team_id}/comments` with card_id/page_id and content in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"create_comment function is a placeholder and not yet implemented",
						requested_args: args,
					},
					null,
					2,
				),
			},
		],
	};
}

/**
 * Edits an existing comment.
 * @param args - Contains team_id, comment_id, and updated content.
 * @param token - The authentication token.
 * @returns The updated comment.
 */
export async function edit_comment(
	args: z.infer<typeof editCommentSchema>,
	token: string,
) {
	// TODO: Implement edit_comment API call
	// Should call: PATCH Edit a comment
	// API endpoint: `/${team_id}/comments/${comment_id}` with content in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"edit_comment function is a placeholder and not yet implemented",
						requested_args: args,
					},
					null,
					2,
				),
			},
		],
	};
}

/**
 * Gets a specific comment by ID.
 * @param args - Contains team_id and comment_id.
 * @param token - The authentication token.
 * @returns The comment details.
 */
export async function get_comment(
	args: z.infer<typeof getCommentSchema>,
	token: string,
) {
	// TODO: Implement get_comment API call
	// Should call: GET Get a comment
	// API endpoint: `/${team_id}/comments/${comment_id}`

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"get_comment function is a placeholder and not yet implemented",
						requested_args: args,
					},
					null,
					2,
				),
			},
		],
	};
}

/**
 * Gets all replies to a specific comment.
 * @param args - Contains team_id and comment_id.
 * @param token - The authentication token.
 * @returns A list of replies to the comment.
 */
export async function get_all_replies_to_comment(
	args: z.infer<typeof getAllRepliesToCommentSchema>,
	token: string,
) {
	// TODO: Implement get_all_replies_to_comment API call
	// Should call: GET Get all replies to a comment
	// API endpoint: `/${team_id}/comments/${comment_id}/replies`

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"get_all_replies_to_comment function is a placeholder and not yet implemented",
						requested_args: args,
					},
					null,
					2,
				),
			},
		],
	};
}

/**
 * Creates a reply to an existing comment.
 * @param args - Contains team_id, comment_id, and reply content.
 * @param token - The authentication token.
 * @returns The created reply.
 */
export async function reply_to_comment(
	args: z.infer<typeof replyToCommentSchema>,
	token: string,
) {
	// TODO: Implement reply_to_comment API call
	// Should call: POST Reply to a comment
	// API endpoint: `/${team_id}/comments/${comment_id}/replies` with content in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"reply_to_comment function is a placeholder and not yet implemented",
						requested_args: args,
					},
					null,
					2,
				),
			},
		],
	};
}

/**
 * Edits an existing reply to a comment.
 * @param args - Contains team_id, reply_id, and updated content.
 * @param token - The authentication token.
 * @returns The updated reply.
 */
export async function edit_reply(
	args: z.infer<typeof editReplySchema>,
	token: string,
) {
	// TODO: Implement edit_reply API call
	// Should call: PATCH Edit a reply
	// API endpoint: `/${team_id}/replies/${reply_id}` with content in body

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(
					{
						error: "Not implemented",
						message:
							"edit_reply function is a placeholder and not yet implemented",
						requested_args: args,
					},
					null,
					2,
				),
			},
		],
	};
}

/**
 * Registers all comment-related tools with the MCP server.
 * @param server - The MCP server instance.
 * @param authToken - The authentication token to be used by the tools.
 */
export function registerCommentTools(server: McpServer, authToken: string) {
	server.registerTool(
		"create_comment",
		{
			title: "Create Comment",
			description: "Creates a new comment on a card or page.",
			inputSchema: createCommentSchema.shape,
		},
		(args) => create_comment(args, authToken),
	);

	server.registerTool(
		"edit_comment",
		{
			title: "Edit Comment",
			description: "Edits an existing comment.",
			inputSchema: editCommentSchema.shape,
		},
		(args) => edit_comment(args, authToken),
	);

	server.registerTool(
		"get_comment",
		{
			title: "Get Comment",
			description: "Gets a specific comment by ID.",
			inputSchema: getCommentSchema.shape,
		},
		(args) => get_comment(args, authToken),
	);

	server.registerTool(
		"get_all_replies_to_comment",
		{
			title: "Get All Replies to Comment",
			description: "Gets all replies to a specific comment.",
			inputSchema: getAllRepliesToCommentSchema.shape,
		},
		(args) => get_all_replies_to_comment(args, authToken),
	);

	server.registerTool(
		"reply_to_comment",
		{
			title: "Reply to Comment",
			description: "Creates a reply to an existing comment.",
			inputSchema: replyToCommentSchema.shape,
		},
		(args) => reply_to_comment(args, authToken),
	);

	server.registerTool(
		"edit_reply",
		{
			title: "Edit Reply",
			description: "Edits an existing reply to a comment.",
			inputSchema: editReplySchema.shape,
		},
		(args) => edit_reply(args, authToken),
	);
}
