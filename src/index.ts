import app from "./app";
import { createMCPServer } from "./server";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const superthreadToken = env.SUPERTHREAD_PAT;
    if (!superthreadToken) {
      throw new Error("SUPERTHREAD_PAT secret not set");
    }

    const mcpServer = createMCPServer(superthreadToken);

    const provider = new OAuthProvider({
      apiRoute: "/sse",
      apiHandler: mcpServer.mount("/sse"),
      // @ts-expect-error
      defaultHandler: app,
      authorizeEndpoint: "/authorize",
      tokenEndpoint: "/token",
      clientRegistrationEndpoint: "/register",
    });

    return provider.fetch(request, env, ctx);
  },
};