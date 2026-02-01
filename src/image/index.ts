import type {
	ImageModelV3,
	ImageModelV3CallOptions,
	ImageModelV3ProviderMetadata,
	ImageModelV3Usage,
	JSONObject,
	SharedV3Warning,
} from "@ai-sdk/provider";

export type YandexImageModelId = "yandex-art/latest" | (string & {});

export type YandexImageMessage = {
	/**
	 * Text describing the image.
	 */
	text: string;

	/**
	 * Message weight. Negative values indicate negative messages.
	 */
	weight: number;
};

export type YandexImageGenerationRequest = {
	/**
	 * The model URI to be used for image generation.
	 */
	modelUri: `art://${string}/${string}`;

	/**
	 * A list of messages representing the context for the image generation model.
	 */
	messages: YandexImageMessage[];

	generationOptions: {
		/**
		 * The MIME type of generated image format.
		 */
		mimeType: string;

		/**
		 * Seed for image generation. It serves as a starting point for image generation from noise. If set to 0 or not provided, a randomly generated value will be used.
		 */
		seed?: number;

		/**
		 * Aspect ratio of generated image.
		 */
		aspectRatio?: {
			/**
			 * Weight of width in image.
			 */
			width: number;

			/**
			 * Weight of height in image.
			 */
			height: number;
		};
	};
};

type YandexImageGenerationResponse = {
	/**
	 * ID of the operation.
	 */
	id: string;

	/**
	 * Description of the operation.
	 */
	description: string;

	/**
	 * Creation timestamp.
	 */
	createdAt: string;

	/**
	 * ID of the user or service account who initiated the operation.
	 */
	createdBy: string;

	/**
	 * The time when the Operation resource was last modified.
	 */
	modifiedAt: string;

	/**
	 * If the value is false, it means the operation is still in progress.
	 * If true, the operation is completed, and either error or response is available.
	 */
	done: boolean;

	/**
	 * Service-specific metadata associated with the operation.
	 * It typically contains the ID of the target resource that the operation is performed on.
	 * Any method that returns a long-running operation should document the metadata type, if any.
	 */
	metadata: JSONObject;

	/**
	 * The response message.
	 */
	response?: {
		/**
		 * The image is serialized as an array of bytes encoded in Base64.
		 */
		image: string;

		/**
		 * The model version changes with each new releases.
		 */
		modelVersion: string;
	};

	/**
	 * The error result of the operation in case of failure or cancellation.
	 */
	error?: {
		/**
		 * Error code. An enum value of google.rpc.Code.
		 */
		code: number;

		/**
		 * Error message.
		 */
		message: string;

		/**
		 * Error details.
		 */
		details: JSONObject[];
	};
};

export class YandexImageModel implements ImageModelV3 {
	private folderId: string;
	private secretKey: string;
	readonly maxImagesPerCall = 1;
	readonly specificationVersion = "v3";
	readonly provider = "yandex-cloud";
	readonly modelId: string;
	readonly supportedUrls = {};

	constructor(
		modelId: YandexImageModelId,
		{ folderId, secretKey }: { folderId: string; secretKey: string },
	) {
		this.modelId = modelId;
		this.folderId = folderId;
		this.secretKey = secretKey;
	}

	private async getImageGenerationResult(id: string) {
		const response = await fetch(
			`https://operation.api.cloud.yandex.net/operations/${id}`,
			{
				method: "GET",
				headers: {
					Authorization: `Api-Key ${this.secretKey}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error(
				`Yandex API error: ${response.status} ${response.statusText}: ${await response.text()}`,
			);
		}

		const data = (await response.json()) as YandexImageGenerationResponse;

		if (data.error) {
			throw new Error(data.error.message);
		}

		return data;
	}

	async doGenerate(options: ImageModelV3CallOptions): Promise<{
		images: Array<string> | Array<Uint8Array>;
		warnings: Array<SharedV3Warning>;
		providerMetadata?: ImageModelV3ProviderMetadata;
		response: {
			timestamp: Date;
			modelId: string;
			headers: Record<string, string> | undefined;
		};
		usage?: ImageModelV3Usage;
	}> {
		if (!options.prompt) {
			throw new Error("Prompt is required");
		}

		let width: string | undefined;
		let height: string | undefined;
		if (options.aspectRatio) {
			[width, height] = options.aspectRatio.split(":");
		}

		const body: YandexImageGenerationRequest = {
			modelUri: `art://${this.folderId}/${this.modelId}`,
			messages: [
				{
					text: options.prompt,
					weight: 1,
				},
			],
			generationOptions: {
				mimeType: "image/png",
				seed: options.seed,
				aspectRatio:
					width && height
						? {
								width: Number.parseInt(width, 10),
								height: Number.parseInt(height, 10),
							}
						: undefined,
			},
		};

		const response = await fetch(
			"https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync",
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

		const initialData =
			(await response.json()) as YandexImageGenerationResponse;

		const data = await new Promise<YandexImageGenerationResponse>((resolve) => {
			const interval = setInterval(async () => {
				const data = await this.getImageGenerationResult(initialData.id);
				if (data.done) {
					clearInterval(interval);
					resolve(data);
				}
			}, 1000);
		});

		if (data.error) {
			throw new Error(data.error.message);
		}

		if (!data.response?.image) {
			throw new Error("Image generation failed");
		}

		return {
			images: [data.response.image],
			warnings: [],
			response: {
				timestamp: new Date(),
				modelId: this.modelId,
				headers: Object.fromEntries(response.headers.entries()),
			},
		};
	}
}
