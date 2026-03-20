import { apiClient } from "./api-client.js";
import { filterUserAccount, filterSpaces } from "./response-filters.js";

export interface ContextList {
    id: string;
    title: string;
    behavior: string;
}

export interface ContextBoard {
    id: string;
    title: string;
    lists: ContextList[];
}

export interface ContextSpace {
    id: string;
    title: string;
    boards: ContextBoard[];
}

export interface WorkspaceContext {
    user_id: string;
    team_id: string;
    spaces: ContextSpace[];
}

export interface ResolvedIds {
    team_id: string;
    project_id?: string;
    board_id?: string;
    list_id?: string;
}

// Per-token cache valid within a worker instance lifetime
const contextCache = new Map<string, { ctx: WorkspaceContext; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches full workspace context in as few round trips as possible.
 * Flow: account → spaces → board details (fanned out in parallel).
 * Cached per-token for CACHE_TTL_MS within the worker instance.
 */
export async function getContext(token: string): Promise<WorkspaceContext> {
    const cached = contextCache.get(token);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        return cached.ctx;
    }

    // Round trip 1: resolve team_id and user_id
    const accountRaw = await apiClient.makeRequest<any>("/users/me", token);
    const account = filterUserAccount(accountRaw);
    const { team_id, user_id } = account;

    // Round trip 2: get all spaces with board stubs
    const spacesRaw = await apiClient.makeRequest<any>(`/${team_id}/projects`, token);
    const { spaces } = filterSpaces(spacesRaw);

    // Round trip 3: fan out board detail fetches in parallel (lists only, no cards)
    type BoardRef = { spaceIdx: number; boardIdx: number; board_id: string };
    const allBoardRefs: BoardRef[] = [];
    spaces.forEach((space, si) => {
        space.boards.forEach((board, bi) => {
            allBoardRefs.push({ spaceIdx: si, boardIdx: bi, board_id: board.id });
        });
    });

    const listsPerBoard = await Promise.all(
        allBoardRefs.map(({ board_id }) =>
            apiClient
                .makeRequest<any>(`/${team_id}/boards/${board_id}`, token)
                .then((res: any) => {
                    const board = res.board || res;
                    return (board.lists || []).map((l: any) => ({
                        id: l.id,
                        title: l.title || l.name,
                        behavior: l.behavior || "active",
                    })) as ContextList[];
                })
                .catch(() => [] as ContextList[]),
        ),
    );

    const enrichedSpaces: ContextSpace[] = spaces.map((space, si) => ({
        id: space.id,
        title: space.title,
        boards: space.boards.map((board, bi) => {
            const refIdx = allBoardRefs.findIndex(
                (r) => r.spaceIdx === si && r.boardIdx === bi,
            );
            return {
                id: board.id,
                title: board.title,
                lists: refIdx >= 0 ? listsPerBoard[refIdx] : [],
            };
        }),
    }));

    const ctx: WorkspaceContext = { user_id, team_id, spaces: enrichedSpaces };
    contextCache.set(token, { ctx, ts: Date.now() });
    return ctx;
}

function fuzzyFind<T extends { id: string; title: string }>(
    items: T[],
    query: string,
): T | null {
    const q = query.toLowerCase().trim();
    const exact = items.find((i) => i.title.toLowerCase() === q);
    if (exact) return exact;
    const startsWith = items.find((i) => i.title.toLowerCase().startsWith(q));
    if (startsWith) return startsWith;
    return items.find((i) => i.title.toLowerCase().includes(q)) ?? null;
}

/**
 * Resolves space/board/list names to IDs via fuzzy matching.
 * Always returns team_id. Other fields only populated when the
 * corresponding name option is provided.
 */
export async function resolveIds(
    token: string,
    opts: {
        space_name?: string;
        board_name?: string;
        list_name?: string;
        list_behavior?: string;
    },
): Promise<ResolvedIds> {
    const ctx = await getContext(token);
    const result: ResolvedIds = { team_id: ctx.team_id };

    let searchSpaces = ctx.spaces;
    if (opts.space_name) {
        const space = fuzzyFind(ctx.spaces, opts.space_name);
        if (!space) throw new Error(`Space not found: "${opts.space_name}"`);
        result.project_id = space.id;
        searchSpaces = [space];
    }

    if (opts.board_name || opts.list_name || opts.list_behavior) {
        const allBoards = searchSpaces.flatMap((s) => s.boards);
        const board = opts.board_name
            ? fuzzyFind(allBoards, opts.board_name)
            : (allBoards[0] ?? null);
        if (!board) throw new Error(`Board not found: "${opts.board_name}"`);
        result.board_id = board.id;

        if (opts.list_name || opts.list_behavior) {
            let list: ContextList | null = null;
            if (opts.list_name) {
                list = fuzzyFind(board.lists, opts.list_name);
            } else if (opts.list_behavior) {
                list = board.lists.find((l) => l.behavior === opts.list_behavior) ?? null;
            }
            if (!list) {
                throw new Error(`List not found: "${opts.list_name ?? opts.list_behavior}"`);
            }
            result.list_id = list.id;
        }
    }

    return result;
}
