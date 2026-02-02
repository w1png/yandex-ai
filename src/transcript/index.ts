import type {
	JSONObject,
	SharedV3Headers,
	SharedV3Warning,
	TranscriptionModelV3,
	TranscriptionModelV3CallOptions,
} from "@ai-sdk/provider";

export interface YandexTranscriptCallOptions
	extends TranscriptionModelV3CallOptions {
	/**
	 * Audio data to transcribe.
	 * Accepts a `Uint8Array` or `string`, where `string` is a base64 encoded audio file.
	 */
	audio: Uint8Array | string;
	/**
	 * The IANA media type of the audio data.
	 *
	 * @see https://www.iana.org/assignments/media-types/media-types.xhtml
	 */
	mediaType: string;
	/**
	 * Additional provider-specific options that are passed through to the provider
	 * as body parameters.
	 *
	 * The outer record is keyed by the provider name, and the inner
	 * record is keyed by the provider-specific metadata key.
	 * ```ts
	 * {
	 * "openai": {
	 * "timestampGranularities": ["word"]
	 * }
	 * }
	 * ```
	 */
	providerOptions?: {
		yandex?: {
			/**
			 * Recognition language.
			 * See the [model description](https://yandex.cloud/en/docs/speechkit/stt/models) for acceptable values. The default value is ru-RU, Russian.
			 */
			lang?: /**
			 * [Automatic language recognition](https://yandex.cloud/en/docs/speechkit/stt/models#language-labels)
			 */
				| "auto"
				/**
				 * Russian
				 */
				| "ru-RU"
				/**
				 * English
				 */
				| "en-US"
				/**
				 * German
				 */
				| "de-DE"
				/**
				 * Spanish
				 */
				| "es-ES"
				/**
				 * French
				 */
				| "fr-FR"
				/**
				 * Italian
				 */
				| "it-IT"
				/**
				 * Portuguese
				 */
				| "pt-PT"
				/**
				 * Brazilian Portuguese
				 */
				| "pt-BR"
				/**
				 * Dutch
				 */
				| "nl-NL"
				/**
				 * Swedish
				 */
				| "sv-SE"
				/**
				 * Finnish
				 */
				| "fi-FI"
				/**
				 * Turkish
				 */
				| "tr-TR"
				/**
				 * Hebrew
				 */
				| "he-IL"
				/**
				 * Kazakh
				 */
				| "kk-KZ"
				/**
				 * Polish
				 */
				| "pl-PL"
				/**
				 * Uzbek
				 */
				| "uz-UZ";
			/**
			 * Language model to use for recognition.
			 * The more accurate your choice of the model, the better the recognition result. You can specify only one model per request.
			 * The [acceptable values](https://yandex.cloud/en/docs/speechkit/stt/models) depend on the language you select. The default value is general.
			 */
			topic: "general" | "general:rc" | "general:deprecated";
			/**
			 * Submitted audio [format](https://yandex.cloud/en/docs/speechkit/formats).
			 * Acceptable values:
			 * lpcm: [LPCM without a WAV header](https://yandex.cloud/en/docs/speechkit/formats#lpcm).
			 * oggopus (default): [OggOpus](https://yandex.cloud/en/docs/speechkit/formats#oggopus).
			 */
			format?: "lpcm" | "oggopus";
			/**
			 * This parameter controls the profanity filter in recognized speech.
			 * Acceptable values:
			 * false (default): Profanities will not be excluded from the recognition results.
			 * true: Profanities will be excluded from the recognition results.
			 */
			profanityFilter?: boolean;
			/**
			 * Flag for how to write numbers: true for words, false (default) for figures.
			 */
			rawResults?: boolean;
			/**
			 * Submitted audio sampling frequency.
			 * Applies if format equals lpcm. Acceptable values:
			 * 48000 (default): 48 kHz.
			 * 16000: 16 kHz.
			 * 8000: 8 kHz.
			 */
			sampleRateHertz?: 48000 | 16000 | 8000;
		};
	};
	/**
	 * Abort signal for cancelling the operation.
	 */
	abortSignal?: AbortSignal;
	/**
	 * Additional HTTP headers to be sent with the request.
	 * Only applicable for HTTP-based providers.
	 */
	headers?: Record<string, string | undefined>;
}

export type YandexTranscriptRequest = {
	/**
	 * Recognition language.
	 * See the [model description](https://yandex.cloud/en/docs/speechkit/stt/models) for acceptable values. The default value is ru-RU, Russian.
	 */
	lang?: /**
	 * [Automatic language recognition](https://yandex.cloud/en/docs/speechkit/stt/models#language-labels)
	 */
		| "auto"
		/**
		 * Russian
		 */
		| "ru-RU"
		/**
		 * English
		 */
		| "en-US"
		/**
		 * German
		 */
		| "de-DE"
		/**
		 * Spanish
		 */
		| "es-ES"
		/**
		 * French
		 */
		| "fr-FR"
		/**
		 * Italian
		 */
		| "it-IT"
		/**
		 * Portuguese
		 */
		| "pt-PT"
		/**
		 * Brazilian Portuguese
		 */
		| "pt-BR"
		/**
		 * Dutch
		 */
		| "nl-NL"
		/**
		 * Swedish
		 */
		| "sv-SE"
		/**
		 * Finnish
		 */
		| "fi-FI"
		/**
		 * Turkish
		 */
		| "tr-TR"
		/**
		 * Hebrew
		 */
		| "he-IL"
		/**
		 * Kazakh
		 */
		| "kk-KZ"
		/**
		 * Polish
		 */
		| "pl-PL"
		/**
		 * Uzbek
		 */
		| "uz-UZ";
	/**
	 * Language model to use for recognition.
	 * The more accurate your choice of the model, the better the recognition result. You can specify only one model per request.
	 * The [acceptable values](https://yandex.cloud/en/docs/speechkit/stt/models) depend on the language you select. The default value is general.
	 */
	topic: "general" | "general:rc" | "general:deprecated";
	/**
	 * Submitted audio [format](https://yandex.cloud/en/docs/speechkit/formats).
	 * Acceptable values:
	 * lpcm: [LPCM without a WAV header](https://yandex.cloud/en/docs/speechkit/formats#lpcm).
	 * oggopus (default): [OggOpus](https://yandex.cloud/en/docs/speechkit/formats#oggopus).
	 */
	format?: "lpcm" | "oggopus";
	/**
	 * This parameter controls the profanity filter in recognized speech.
	 * Acceptable values:
	 * false (default): Profanities will not be excluded from the recognition results.
	 * true: Profanities will be excluded from the recognition results.
	 */
	profanityFilter?: boolean;
	/**
	 * Flag for how to write numbers: true for words, false (default) for figures.
	 */
	rawResults?: boolean;
	/**
	 * Submitted audio sampling frequency.
	 * Applies if format equals lpcm. Acceptable values:
	 * 48000 (default): 48 kHz.
	 * 16000: 16 kHz.
	 * 8000: 8 kHz.
	 */
	sampleRateHertz?: 48000 | 16000 | 8000;
};
export class YandexTranscriptModel implements TranscriptionModelV3 {
	private folderId: string;
	private secretKey: string;

	readonly specificationVersion = "v3";
	readonly provider = "yandex-cloud";
	readonly modelId = "sst:recognize";

	constructor({
		folderId,
		secretKey,
	}: { folderId: string; secretKey: string }) {
		this.folderId = folderId;
		this.secretKey = secretKey;
	}

	async doGenerate(options: YandexTranscriptCallOptions): Promise<{
		text: string;
		segments: Array<{ text: string; startSecond: number; endSecond: number }>;
		language: string | undefined;
		durationInSeconds: number | undefined;
		warnings: Array<SharedV3Warning>;
		request?: { body?: string };
		response: {
			timestamp: Date;
			modelId: string;
			headers?: SharedV3Headers;
			body?: unknown;
		};
		providerMetadata?: Record<string, JSONObject>;
	}> {
		const body: YandexTranscriptRequest = {
			lang: options.providerOptions?.yandex?.lang ?? "auto",
			format: options.providerOptions?.yandex?.format ?? "oggopus",
			sampleRateHertz:
				options.providerOptions?.yandex?.sampleRateHertz ?? 48000,
			topic: options.providerOptions?.yandex?.topic ?? "general",
			profanityFilter:
				options.providerOptions?.yandex?.profanityFilter ?? false,
			rawResults: options.providerOptions?.yandex?.rawResults ?? false,
		};

		const queryParams = new URLSearchParams();
		for (const [key, value] of Object.entries(body)) {
			if (value !== undefined && value !== null) {
				queryParams.append(key, String(value));
			}
		}

		const response = await fetch(
			`https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?${queryParams.toString()}`,
			{
				method: "POST",
				headers: {
					Authorization: `Api-Key ${this.secretKey}`,
					"Content-Type": "application/octet-stream",
				},
				body: options.audio,
			},
		);

		if (!response.ok) {
			throw new Error(
				`Yandex STT API error: ${response.status} ${response.statusText}`,
			);
		}

		const data = (await response.json()) as { result: string };

		return {
			text: data.result.length > 0 ? data.result : "нет звуков",
			segments: [],
			language: undefined,
			durationInSeconds: undefined,
			warnings: [],
			request: {
				body: queryParams.toString(),
			},
			response: {
				timestamp: new Date(),
				modelId: this.modelId,
				headers: Object.fromEntries(
					response.headers.entries(),
				) as SharedV3Headers,
				body: data,
			},
		};
	}
}
