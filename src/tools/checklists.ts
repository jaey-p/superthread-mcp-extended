import { z } from "zod";
import { apiClient } from "../lib/api-client.js";

// ============================================================================
// Schemas
// ============================================================================

export const createChecklistSchema = z.object({
    team_id: z.string().describe("Team/workspace ID"),
    card_id: z.string().describe("Card ID to add checklist to"),
    title: z.string().describe("Checklist title"),
});

export const updateChecklistSchema = z.object({
    team_id: z.string().describe("Team/workspace ID"),
    card_id: z.string().describe("Card ID containing the checklist"),
    checklist_id: z.string().describe("Checklist ID to update"),
    title: z.string().describe("New checklist title"),
});

export const deleteChecklistSchema = z.object({
    team_id: z.string().describe("Team/workspace ID"),
    card_id: z.string().describe("Card ID containing the checklist"),
    checklist_id: z.string().describe("Checklist ID to delete"),
});

export const addChecklistItemSchema = z.object({
    team_id: z.string().describe("Team/workspace ID"),
    card_id: z.string().describe("Card ID containing the checklist"),
    checklist_id: z.string().describe("Checklist ID to add item to"),
    title: z.string().describe("Checklist item title"),
});

export const updateChecklistItemSchema = z.object({
    team_id: z.string().describe("Team/workspace ID"),
    card_id: z.string().describe("Card ID containing the checklist"),
    checklist_id: z.string().describe("Checklist ID containing the item"),
    item_id: z.string().describe("Checklist item ID to update"),
    title: z.string().optional().describe("New title for the checklist item"),
    checked: z.boolean().optional().describe("Check/uncheck the item"),
});

export const deleteChecklistItemSchema = z.object({
    team_id: z.string().describe("Team/workspace ID"),
    card_id: z.string().describe("Card ID containing the checklist"),
    checklist_id: z.string().describe("Checklist ID containing the item"),
    item_id: z.string().describe("Checklist item ID to delete"),
});

// ============================================================================
// Tool Implementations
// ============================================================================

export async function createChecklist(
    args: z.infer<typeof createChecklistSchema>,
    token: string,
) {
    const { team_id, card_id, title } = args;
    const result = await apiClient.makeRequest(`/${team_id}/cards/${card_id}/checklists`, token, {
        method: "POST",
        body: JSON.stringify({ title }),
    });
    console.log("createChecklist response:", JSON.stringify(result, null, 2));
    return result;
}

export async function updateChecklist(
    args: z.infer<typeof updateChecklistSchema>,
    token: string,
) {
    const { team_id, card_id, checklist_id, title } = args;
    return apiClient.makeRequest(
        `/${team_id}/cards/${card_id}/checklists/${checklist_id}`,
        token,
        {
            method: "PATCH",
            body: JSON.stringify({ card_id, title }),
        },
    );
}

export async function deleteChecklist(
    args: z.infer<typeof deleteChecklistSchema>,
    token: string,
) {
    const { team_id, card_id, checklist_id } = args;
    console.log(`deleteChecklist: team_id=${team_id}, card_id=${card_id}, checklist_id=${checklist_id}`);
    const result = await apiClient.makeRequest(
        `/${team_id}/cards/${card_id}/checklists/${checklist_id}`,
        token,
        { method: "DELETE" },
    );
    console.log("deleteChecklist response:", JSON.stringify(result, null, 2));
    return { success: true, message: `Checklist ${checklist_id} deleted` };
}

export async function addChecklistItem(
    args: z.infer<typeof addChecklistItemSchema>,
    token: string,
) {
    const { team_id, card_id, checklist_id, title } = args;
    return apiClient.makeRequest(
        `/${team_id}/cards/${card_id}/checklists/${checklist_id}/items`,
        token,
        {
            method: "POST",
            body: JSON.stringify({ title, checklist_id }),
        },
    );
}

export async function updateChecklistItem(
    args: z.infer<typeof updateChecklistItemSchema>,
    token: string,
) {
    const { team_id, card_id, checklist_id, item_id, ...payload } = args;

    const cleanPayload: any = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(cleanPayload).length === 0) {
        throw new Error("No fields to update were provided.");
    }

    return apiClient.makeRequest(
        `/${team_id}/cards/${card_id}/checklists/${checklist_id}/items/${item_id}`,
        token,
        {
            method: "PATCH",
            body: JSON.stringify(cleanPayload),
        },
    );
}

export async function deleteChecklistItem(
    args: z.infer<typeof deleteChecklistItemSchema>,
    token: string,
) {
    const { team_id, card_id, checklist_id, item_id } = args;
    console.log(`deleteChecklistItem: team_id=${team_id}, card_id=${card_id}, checklist_id=${checklist_id}, item_id=${item_id}`);
    const result = await apiClient.makeRequest(
        `/${team_id}/cards/${card_id}/checklists/${checklist_id}/items/${item_id}`,
        token,
        { method: "DELETE" },
    );
    console.log("deleteChecklistItem response:", JSON.stringify(result, null, 2));
    return { success: true, message: `Checklist item ${item_id} deleted` };
}
