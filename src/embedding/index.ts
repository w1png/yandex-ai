import type {
	EmbeddingModelV3,
	EmbeddingModelV3CallOptions,
	EmbeddingModelV3Result,
} from "@ai-sdk/provider";

export type YandexEmbeddingModelId =
	| "text-search-doc/latest"
	| "text-search-query/latest"
	| (string & {});

type YandexEmbeddingRequest = {
	/**
	 * The model URI to be used for obtaining text embeddings.
	 */
	modelUri: string;

	/**
	 * The input text for which the embedding is requested.
	 */
	text: string;

	/**
	 * Optional parameter to specify embedding dimension for models that support multi-dimensional outputs
	 */
	dim?: string;
};

type YandexEmbeddingResponse = {
	/**
	 * A repeated list of double values representing the embedding.
	 */
	embedding: number[];

	/**
	 * The number of tokens in the input text.
	 */
	numTokens: number;

	/**
	 * The model version changes with each new releases.
	 */
	modelVersion: string;
};

export class YandexEmbeddingModel implements EmbeddingModelV3 {
	private folderId: string;
	private secretKey: string;
	readonly maxImagesPerCall = 1;
	readonly specificationVersion = "v3";
	readonly provider = "yandex-cloud";
	readonly modelId: string;
	readonly supportedUrls = {};
	readonly maxEmbeddingsPerCall = 0;
	readonly supportsParallelCalls = false;

	constructor(
		modelId: YandexEmbeddingModelId,
		{ folderId, secretKey }: { folderId: string; secretKey: string },
	) {
		this.modelId = modelId;
		this.folderId = folderId;
		this.secretKey = secretKey;
	}

	async doEmbed(
		options: EmbeddingModelV3CallOptions,
	): Promise<EmbeddingModelV3Result> {
		const body: YandexEmbeddingRequest = {
			modelUri: `emb://${this.folderId}/${this.modelId}`,
			text: options.values.join(" "),
		};

		const response = await fetch(
			"https://llm.api.cloud.yandex.net/foundationModels/v1/textEmbedding",
			{
				method: "POST",
				headers: {
					Authorization: `Api-Key ${this.secretKey}`,
					"Content-Type": "application/json",
					...options.headers,
				},
				body: JSON.stringify(body),
				signal: options.abortSignal,
			},
		);

		if (!response.ok) {
			throw new Error(
				`Yandex API error: ${response.status} ${response.statusText}: ${await response.text()}`,
			);
		}

		const data = (await response.json()) as YandexEmbeddingResponse;

		return {
			embeddings: [data.embedding],
			warnings: [],
			usage: {
				tokens: data.numTokens,
			},
			response: {
				headers: Object.fromEntries(response.headers.entries()),
				body: data,
			},
		};
	}
}
