# Superthread MCP MVP Simplification Plan

## Objective

Streamline the MCP server to focus on core screenshot-to-tasks workflow while minimizing token usage and response bloat.

## Core Problems Identified

1. **Response Bloat**: API responses contain excessive irrelevant data (features, limits, timestamps, etc.)
2. **Confusing Tool Names**: `get_projects` returns workflow lists, not actual projects/spaces
3. **Inefficient Workflow**: Current path requires multiple complex calls with unclear relationships
4. **Token Waste**: Users pay for processing unnecessary metadata in every response

## Proposed MVP Focus

Focus on the single most valuable workflow: **Screenshot to Superthread Tasks**

### Essential Tools Only (8 tools)

1. `get_my_account` - Get team_id (simplified response)
2. `get_spaces` - List workspaces with nested boards (simplified response)
3. `get_board_details` - Get specific board with lists (new, simplified)
4. `create_card` - Create tasks (keep existing)
5. `get_card` - Get task details (simplified response)
6. `update_card` - Update tasks (keep existing)
7. `add_related_card` - Link tasks (keep existing)
8. `archive_card` - Archive tasks (keep existing)

### Simplified Response Strategy

Strip responses to essential fields only:

**get_my_account response:**

```json
{
  "user_id": "uPP0S0zE",
  "team_id": "t4SWmmPG",
  "team_name": "Sorbet",
  "role": "owner"
}
```

**get_spaces response:**

```json
{
  "spaces": [
    {
      "id": "1",
      "title": "Sorbet",
      "boards": [
        { "id": "4", "title": "Design" },
        { "id": "6", "title": "Side Projects" }
      ]
    }
  ]
}
```

**get_board response:**

```json
{
  "board": {
    "id": "4",
    "title": "Design",
    "lists": [
      { "id": "1", "title": "Backlog", "behavior": "backlog" },
      { "id": "3", "title": "In Progress", "behavior": "active" },
      { "id": "4", "title": "Completed", "behavior": "done" }
    ]
  }
}
```

### Response Filtering Strategy

**FILTER OUT (Heavy/Verbose Fields):**

- Timestamps: `time_created`, `time_updated`, `start_date`, `due_date`, `completed_date`
- User objects: `user`, `user_updated` (OAuth details)
- Arrays: `members`, `checklists`, `child_cards`, `linked_cards`, `tags`
- Metadata: `external_links`, `hints`, `collaboration` tokens
- Media: `icon`, `cover_image` objects (base64 data)

**KEEP (Lightweight Essential Fields):**

- IDs: `id`, `board_id`, `list_id`, `project_id`, `team_id`
- Core: `title`, `status`, `priority`, `behavior`
- Content: `content` (for cards only when needed)

**create_card Minimal Requirements:**

- Required: `title`, `list_id`, `board_id`
- Optional: `content`, `project_id`

## Streamlined Workflow

**Screenshot to Tasks (4 API calls):**

1. `get_my_account` → Get team_id
2. `get_spaces` → Get project_id + board_id options
3. `get_board` → Get list_id options for chosen board
4. Multiple `create_card` → Create each task from screenshot

**VERIFIED DATA REQUIREMENTS:**

- create_card requires: team_id, project_id, board_id, list_id
- Current workflow provides: team_id ✅, project_id ✅, board_id ✅, list_id ✅

**DATA FLOW CONFIRMED:**

- `GET /{team_id}/boards/{board_id}` DOES return lists array with id/title/behavior
- All required create_card parameters are available in the 4-step workflow
- No API-level filtering available - must filter responses client-side

## Archive Strategy

Move these tools to `src/tools/archive/` folder:

### Immediate Archive

- `src/tools/projects.ts` (confusing, returns workflow lists)
- `src/tools/comments.ts` (all stubs, secondary feature)
- `src/tools/notes.ts` (all stubs, secondary feature)
- `src/tools/pages.ts` (all stubs, secondary feature)
- `src/tools/lists.ts` (all stubs, covered by get_board_details)
- `src/tools/tags.ts` (all stubs, secondary feature)
- `src/tools/search.ts` (stub, secondary feature)

### Keep Active

- `src/tools/user.ts` (essential, but simplify responses)
- `src/tools/cards.ts` (core functionality)
- `src/tools/boards.ts` (essential, but simplify and rename tools)
- `src/tools/spaces.ts` (essential, already has working get_spaces)

## Implementation Steps

### Phase 0: Data Flow Verification (COMPLETED ✅)

1. ✅ Confirmed `/${team_id}/boards/${board_id}` returns lists array
2. ✅ Lists include id/title/behavior needed for create_card
3. ✅ All workflow data requirements satisfied
4. ✅ No API-level filtering - client-side filtering required

### Phase 1: Response Simplification

1. Create response filtering utilities in `src/lib/response-filters.ts`
2. Add filter functions for each tool response type
3. Apply filters to remove unnecessary fields from all responses
4. Test token usage reduction with simplified responses

### Phase 2: Tool Consolidation

1. Create `src/tools/archive/` directory
2. Move archived tools to archive folder
3. Update `src/server.ts` to only register active tools
4. Enhance existing `get_board` tool to return minimal filtered response
5. Rename/simplify existing tools for clarity

### Phase 3: Workflow Optimization

1. Update tool descriptions to reflect simplified workflow
2. Create workflow documentation showing the 4-call pattern
3. Test end-to-end screenshot-to-tasks workflow
4. Optimize for minimal token usage

### Phase 4: Documentation Update

1. Update README.md to reflect MVP focus
2. Document the simplified workflow
3. Show before/after token usage improvements
4. Remove archived tools from main documentation

## Expected Benefits

1. **Token Efficiency**: 60-80% reduction in response size
2. **Clarity**: Clear 3-step workflow instead of confusing multi-path options
3. **Performance**: Faster responses with less data processing
4. **User Experience**: Simpler tool selection and usage
5. **Maintenance**: Smaller active codebase to maintain

## Success Metrics

- Response payload size reduction (target: 70% smaller)
- Token usage per workflow (target: 50% reduction)
- Time to complete screenshot-to-tasks workflow (target: under 10 seconds)
- User confusion reduction (single clear path instead of multiple options)

## Future Considerations

- Archived tools can be restored if needed for specific use cases
- Response filtering can be made configurable per user preference
- Additional workflows can be added following the same simplification principles
- Consider streaming responses for large datasets to further optimize token usage

## Key API Insights (From API Bot Verification)

### Confirmed Workflow Viability

- ✅ Complete data flow: get_my_account → get_spaces → get_board → create_card
- ✅ All required parameters available at each step
- ✅ No missing data gaps in the workflow

### Filtering Requirements

- ❌ No API-level response filtering available
- ✅ Must implement client-side filtering for token optimization
- ✅ Specific heavy fields identified for removal (timestamps, user objects, arrays)
- ✅ Lightweight essential fields identified for retention

### Implementation Readiness

- ✅ API endpoints confirmed and documented
- ✅ Required vs optional parameters clarified
- ✅ Response structure understood
- ✅ Ready to proceed with Phase 1 implementation
