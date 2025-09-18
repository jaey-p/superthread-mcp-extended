const BASE_URL = "https://api.superthread.com/v1";

export class SuperthreadAPIClient {
	async makeRequest(
		endpoint: string,
		token: string,
		options: RequestInit = {},
	): Promise<any> {
		const startTime = Date.now();

		if (!token) {
			throw new Error(
				"Authorization token is required. Please provide a valid Superthread Personal Access Token.",
			);
		}

		const url = `${BASE_URL}${endpoint}`;
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			...options.headers,
		};

		console.log(
			JSON.stringify({
				event: "api_call_start",
				endpoint,
				method: options.method || "GET",
				url,
				timestamp: new Date().toISOString(),
			}),
		);

		try {
			const response = await fetch(url, {
				...options,
				headers,
			});

			const duration_ms = Date.now() - startTime;

			if (!response.ok) {
				const errorText = await response.text();

				console.log(
					JSON.stringify({
						event: "api_call_error",
						endpoint,
						method: options.method || "GET",
						status: response.status,
						statusText: response.statusText,
						duration_ms,
						error: errorText,
						timestamp: new Date().toISOString(),
					}),
				);

				throw new Error(
					`API request failed: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}

			console.log(
				JSON.stringify({
					event: "api_call_success",
					endpoint,
					method: options.method || "GET",
					status: response.status,
					duration_ms,
					timestamp: new Date().toISOString(),
				}),
			);

			if (response.status === 204) {
				return null;
			}

			return await response.json();
		} catch (error) {
			const duration_ms = Date.now() - startTime;

			console.log(
				JSON.stringify({
					event: "api_call_error",
					endpoint,
					method: options.method || "GET",
					duration_ms,
					error: error instanceof Error ? error.message : String(error),
					timestamp: new Date().toISOString(),
				}),
			);

			throw error;
		}
	}
}

export const apiClient = new SuperthreadAPIClient();
