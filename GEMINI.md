# GEMINI.md

## Project Overview

This project is a Cloudflare Worker that implements a Model Context Protocol (MCP) server. It provides a simple "math" tool with an "add" function. The server is protected by OAuth, and the project includes a simple UI for the OAuth flow.

The main technologies used are:

*   **Cloudflare Workers:** The serverless platform for running the application.
*   **Hono:** A lightweight web framework for building the API and UI.
*   **Model Context Protocol (MCP):** The protocol for communication between the AI agent and the tools.
*   **TypeScript:** The programming language used for the project.

## Building and Running

### Prerequisites

*   Node.js and npm (or pnpm)
*   Wrangler CLI

### Installation

```bash
pnpm install
```

### Running Locally

```bash
npx nx dev remote-mcp-server
```

The application will be available at `http://localhost:8787`.

### Deployment

1.  Create a KV namespace for OAuth:
    ```bash
    npx wrangler kv namespace create OAUTH_KV
    ```
2.  Add the KV namespace ID to `wrangler.jsonc`.
3.  Deploy the application:
    ```bash
    npm run deploy
    ```

## Development Conventions

*   **Formatting:** The project uses Biome for code formatting. Run `npm run format` to format the code.
*   **Linting:** The project uses Biome for linting. Run `npm run lint:fix` to fix linting issues.
*   **Type Checking:** The project uses TypeScript for type checking. Run `npm run type-check` to check for type errors.
