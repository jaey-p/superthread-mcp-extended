/**
 * Standalone Node.js server for Docker deployment
 * Wraps the Cloudflare Workers handler in a Node.js HTTP server
 */

import { createServer } from "node:http";

// Import the worker logic from index.ts
import worker from "./index.js";

const PORT = process.env.PORT || 8787;
const HOST = process.env.HOST || "0.0.0.0";

const server = createServer(async (req, res) => {
	try {
		// Build Request object from Node.js IncomingMessage
		const url = `http://${req.headers.host}${req.url}`;
		const headers = new Headers();
		for (const [key, value] of Object.entries(req.headers)) {
			if (value) {
				headers.set(key, Array.isArray(value) ? value.join(", ") : value);
			}
		}

		// Read body for POST requests
		let body: string | undefined;
		if (req.method === "POST") {
			const chunks: Buffer[] = [];
			for await (const chunk of req) {
				chunks.push(chunk);
			}
			body = Buffer.concat(chunks).toString("utf-8");
		}

		// Create Web API Request
		const request = new Request(url, {
			method: req.method,
			headers,
			body,
		});

		// Call the Cloudflare Workers fetch handler
		const response = await worker.fetch(request, {} as any, {} as any);

		// Convert Response to Node.js response
		res.statusCode = response.status;
		response.headers.forEach((value, key) => {
			res.setHeader(key, value);
		});

		const responseBody = await response.text();
		res.end(responseBody);
	} catch (error) {
		console.error("Server error:", error);
		res.statusCode = 500;
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify({ error: "Internal server error" }));
	}
});

server.listen(Number(PORT), HOST, () => {
	console.log(`🚀 Superthread MCP Extended running on http://${HOST}:${PORT}`);
	console.log(`📍 Health check: http://${HOST}:${PORT}/health`);
	console.log(`📍 MCP endpoint: http://${HOST}:${PORT}/mcp/app`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
	console.log("SIGTERM signal received: closing HTTP server");
	server.close(() => {
		console.log("HTTP server closed");
		process.exit(0);
	});
});
