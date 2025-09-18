export class SuperthreadAPIError extends Error {
	constructor(
		public readonly status: number,
		public readonly statusText: string,
		public readonly responseText: string,
	) {
		super(`API request failed: ${status} ${statusText} - ${responseText}`);
		this.name = "SuperthreadAPIError";
	}
}

export class SuperthreadAPIClient {
	private readonly baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl ?? "https://api.superthread.com/v1";
	}

	public async makeRequest<T>(
		endpoint: string,
		token: string,
		options: RequestInit = {},
	): Promise<T> {
		if (!token) {
			throw new Error(
				"Authorization token is required. Please provide a valid Superthread Personal Access Token.",
			);
		}

		const url = `${this.baseUrl}${endpoint}`;
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			...options.headers,
		};

		const startTime = Date.now();
		const method = options.method ?? "GET";

		try {
			const response = await fetch(url, { ...options, headers });
			const durationMs = Date.now() - startTime;

			if (!response.ok) {
				const errorText = await response.text();
				throw new SuperthreadAPIError(
					response.status,
					response.statusText,
					errorText,
				);
			}

			if (response.status === 204) {
				return null as T;
			}

			return (await response.json()) as T;
		} catch (error) {
			if (error instanceof SuperthreadAPIError) {
				throw error;
			}

			const durationMs = Date.now() - startTime;
			const errorMessage =
				error instanceof Error ? error.message : String(error);

			throw new Error(`Request failed: ${errorMessage}`);
		}
	}
}

export const apiClient = new SuperthreadAPIClient();
