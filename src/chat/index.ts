import type {
	LanguageModelV3,
	LanguageModelV3CallOptions,
	LanguageModelV3Content,
	LanguageModelV3FinishReason,
	LanguageModelV3GenerateResult,
	LanguageModelV3StreamPart,
	LanguageModelV3StreamResult,
	LanguageModelV3Usage,
	SharedV3Warning,
} from "@ai-sdk/provider";

export type YandexFinishStatus =
	| "ALTERNATIVE_STATUS_UNSPECIFIED"
	| "ALTERNATIVE_STATUS_PARTIAL"
	| "ALTERNATIVE_STATUS_TRUNCATED_FINAL"
	| "ALTERNATIVE_STATUS_FINAL"
	| "ALTERNATIVE_STATUS_CONTENT_FILTER"
	| "ALTERNATIVE_STATUS_TOOL_CALLS";

export type YandexToolCall = {
	functionCall: {
		/** The name of the function being called. */
		name: string;
		/**
		 * The structured arguments passed to the function.
		 * These arguments must adhere to the JSON Schema defined in the corresponding function's parameters.
		 */
		arguments: unknown;
	};
};

export type YandexToolResult = {
	functionResult: {
		/** The name of the function that was executed. */
		name: string;
		/**
		 * The result of the function call, represented as a string.
		 * This field can be used to store the output of the function.
		 */
		content: string;
	};
};

export type YandexMessageRole = "assistant" | "user" | "system";

export type YandexMessage =
	| {
			role: YandexMessageRole;
			text: string;
			toolCallList?: undefined;
			toolResultList?: undefined;
	  }
	| {
			role: YandexMessageRole;
			text?: undefined;
			toolCallList: {
				toolCalls: YandexToolCall[];
			};
			toolResultList?: undefined;
	  }
	| {
			role: YandexMessageRole;
			text?: undefined;
			toolCallList?: undefined;
			toolResultList: {
				toolResults: YandexToolResult[];
			};
	  };

export type YandexModelId =
	| "aliceai-llm"
	| "yandexgpt/rc"
	| "yandexgpt-lite"
	| "yandexgpt/latest"
	| "qwen3-235b-a22b-fp8/latest"
	| "gpt-oss-120b/latest"
	| "gpt-oss-20b/latest"
	| "gemma-3-27b-it/latest"
	| (string & {});

export type YandexTool = {
	/** The name of the function. */
	name: string;
	/** A description of the function's purpose or behavior. */
	description?: string;
	/**
	 * A JSON Schema that defines the expected parameters for the function.
	 * The schema should describe the required fields, their types, and any constraints or default values.
	 */
	parameters: Record<string, unknown>;
	/**
	 * Enforces strict adherence to the function schema, ensuring only defined parameters are used.
	 */
	strict: boolean;
};

/**
 * REASONING_MODE_UNSPECIFIED: Unspecified reasoning mode.
 * DISABLED: Disables reasoning. The model will generate a response without performing any internal reasoning.
 * ENABLED_HIDDEN: Enables reasoning in a hidden manner without exposing the reasoning steps to the user.
 */
export type YandexReasoningMode =
	| "REASONING_MODE_UNSPECIFIED"
	| "DISABLED"
	| "ENABLED_HIDDEN";

export type YandexToolChoice =
	| {
			/**
			 * Specifies the overall tool-calling mode.
			 * TOOL_CHOICE_MODE_UNSPECIFIED: The server will choose the default behavior, which is AUTO.
			 * NONE: The model will not call any tool and will generate a standard text response.
			 * AUTO: The model can choose between generating a text response or calling one or more tools. This is the default behavior.
			 * REQUIRED: The model is required to call one or more tools.
			 */
			mode: "TOOL_CHOICE_MODE_UNSPECIFIED" | "NONE" | "AUTO" | "REQUIRED";
	  }
	| {
			/**
			 * Forces the model to call a specific function.
			 * The provided string must match the name of a function in the API request.
			 */
			functionName: string;
	  };

/** Request for the service to generate text completion. */
export type YandexCompletionRequest = {
	/** The ID of the model to be used for completion generation. */
	modelUri: `gpt://${string}/${string}`;
	/** Configuration options for completion generation. */
	completionOptions?: {
		/** Enables streaming of partially generated text. */
		stream?: boolean;
		/**
		 * Affects creativity and randomness of responses. Should be a double number between 0 (inclusive) and 1 (inclusive).
		 * Lower values produce more straightforward responses while higher values lead to increased creativity and randomness.
		 * Default temperature: 0.3
		 */
		temperature?: number;
		/**
		 * The limit on the number of tokens used for single completion generation.
		 * Must be greater than zero. This maximum allowed parameter value may depend on the model being used.
		 */
		maxTokens?: number;
		/**
		 * Configures reasoning capabilities for the model, allowing it to perform internal reasoning before responding.
		 */
		reasoningOptions?: YandexReasoningMode;
	};
	/** List of tools that are available for the model to invoke during the completion generation. */
	tools?: {
		function: YandexTool;
	}[];
	/** A list of messages representing the context for the completion model. */
	messages: YandexMessage[];
	/**
	 * When set to true, the model will respond with a valid JSON object.
	 * Be sure to explicitly ask the model for JSON.
	 * Otherwise, it may generate excessive whitespace and run indefinitely until it reaches the token limit.
	 * Includes only one of the fields jsonObject, jsonSchema.
	 */
	jsonObject?: boolean;
	/**
	 * Enforces a specific JSON structure for the model's response based on a provided schema.
	 * Includes only one of the fields jsonObject, jsonSchema.
	 */
	jsonSchema?: {
		schema: Record<string, unknown>;
	};
	/** Controls whether the model can generate multiple tool calls in a single response. Defaults to true. */
	parallelToolCalls?: boolean;
	/** Specifies how the model should select which tool (or tools) to use when generating a response. */
	toolChoice?: YandexToolChoice;
};

export type YandexAlternatives = {
	message: YandexMessage;
	status: YandexFinishStatus;
};

export type YandexCompletionResponse = {
	alternatives: YandexAlternatives[];
	usage: {
		inputTextTokens: string;
		completionTokens: string;
		totalTokens: string;
		completionTokensDetails: {
			reasoningTokens: string;
		};
	};
	modelVersion: string;
};

export type YandexChatProviderOptions = {
	/**
	 * Configures reasoning capabilities for the model, allowing it to perform internal reasoning before responding.
	 */
	reasoningOptions?: YandexReasoningMode;
	/** Controls whether the model can generate multiple tool calls in a single response. Defaults to true. */
	parallelToolCalls?: boolean;
};

export class YandexChatModel implements LanguageModelV3 {
	private folderId: string;
	private secretKey: string;
	readonly specificationVersion = "v3";
	readonly provider = "yandex-cloud";
	readonly modelId: string;
	readonly supportedUrls = {};

	constructor(
		modelId: YandexModelId,
		{ folderId, secretKey }: { folderId: string; secretKey: string },
	) {
		this.modelId = modelId;
		this.folderId = folderId;
		this.secretKey = secretKey;
	}

	private convertTools(tools: LanguageModelV3CallOptions["tools"]) {
		const warnings: SharedV3Warning[] = [];
		const convertedTools: YandexTool[] = [];
		if (!tools) {
			return { tools: [], warnings: [] };
		}
		for (const tool of tools) {
			if (tool.type !== "function") {
				warnings.push({
					type: "unsupported",
					feature: "non function tools",
				});
				continue;
			}
			convertedTools.push({
				name: tool.name,
				description: tool.description,
				parameters: tool.inputSchema,
				strict: true,
			});
		}
		return {
			tools: convertedTools.map((tool) => ({
				function: tool,
			})),
			warnings,
		};
	}

	private convertRole(
		role: LanguageModelV3CallOptions["prompt"][number]["role"],
	): YandexMessageRole {
		switch (role) {
			case "assistant":
				return "assistant";
			case "user":
				return "user";
			default:
				return "system";
		}
	}

	private convertFromAiSdkToYandex(
		messages: LanguageModelV3CallOptions["prompt"],
	) {
		const warnings: SharedV3Warning[] = [];
		const convertedMessages: YandexMessage[] = [];
		for (const message of messages) {
			const role = this.convertRole(message.role);
			if (typeof message.content === "string") {
				convertedMessages.push({
					role,
					text: message.content,
				});
				continue;
			}
			for (const part of message.content) {
				if (typeof part === "string") {
					convertedMessages.push({
						role,
						text: part,
					});
					continue;
				}
				switch (part.type) {
					case "text":
						convertedMessages.push({
							role,
							text: part.text,
						});
						continue;
					case "tool-call":
						convertedMessages.push({
							role,
							toolCallList: {
								toolCalls: [
									{
										functionCall: {
											name: part.toolName,
											arguments: part.input,
										},
									},
								],
							},
						});
						continue;
					case "tool-result":
						convertedMessages.push({
							role: "user",
							toolResultList: {
								toolResults: [
									{
										functionResult: {
											name: part.toolName,
											content: JSON.stringify(part.output),
										},
									},
								],
							},
						});
						continue;
					case "file":
						throw new Error("Files are not implemented yet");
					case "reasoning":
						throw new Error("Reasoning is not implemented yet");
					case "tool-approval-response":
						throw new Error("Tool approval is not implemented yet");
				}
			}
		}
		return {
			messages: convertedMessages,
			warnings,
		};
	}

	private convertFromYandexToAiSdk(alternatives: YandexAlternatives[]) {
		let status: LanguageModelV3FinishReason = {
			raw: undefined,
			unified: "stop",
		};
		const content: LanguageModelV3Content[] = [];
		for (const part of alternatives) {
			status = this.convertFinishReason(part.status);
			if (part.message.text) {
				content.push({
					type: "text",
					text: part.message.text,
				});
			} else if (part.message.toolCallList) {
				for (const toolCall of part.message.toolCallList.toolCalls) {
					content.push({
						toolCallId: crypto.randomUUID(),
						type: "tool-call",
						toolName: toolCall.functionCall.name,
						input: JSON.stringify(toolCall.functionCall.arguments),
					});
				}
			} else if (part.message.toolResultList) {
				for (const toolResult of part.message.toolResultList.toolResults) {
					content.push({
						toolCallId: crypto.randomUUID(),
						type: "tool-result",
						toolName: toolResult.functionResult.name,
						result: JSON.parse(toolResult.functionResult.content),
					});
				}
			}
		}
		return {
			content,
			finishReason: status,
		};
	}

	private convertToolChoice(
		toolChoice?: LanguageModelV3CallOptions["toolChoice"],
	): YandexToolChoice {
		if (!toolChoice) {
			return {
				mode: "TOOL_CHOICE_MODE_UNSPECIFIED",
			};
		}
		if (toolChoice.type === "tool") {
			return {
				functionName: toolChoice.toolName,
			};
		}
		switch (toolChoice.type) {
			case "auto":
				return {
					mode: "AUTO",
				};
			case "none":
				return {
					mode: "NONE",
				};
			case "required":
				return {
					mode: "REQUIRED",
				};
		}
	}

	private convertFinishReason(
		reason: YandexFinishStatus,
	): LanguageModelV3FinishReason {
		switch (reason) {
			case "ALTERNATIVE_STATUS_UNSPECIFIED":
				return {
					raw: reason,
					unified: "stop",
				};
			case "ALTERNATIVE_STATUS_PARTIAL":
				return {
					raw: reason,
					unified: "other",
				};
			case "ALTERNATIVE_STATUS_TRUNCATED_FINAL":
				return {
					raw: reason,
					unified: "length",
				};
			case "ALTERNATIVE_STATUS_FINAL":
				return {
					raw: reason,
					unified: "stop",
				};
			case "ALTERNATIVE_STATUS_CONTENT_FILTER": {
				return {
					raw: reason,
					unified: "other",
				};
			}
			case "ALTERNATIVE_STATUS_TOOL_CALLS": {
				return {
					raw: reason,
					unified: "tool-calls",
				};
			}
		}
	}

	private async request(stream: boolean, options: LanguageModelV3CallOptions) {
		const { messages, warnings: messageWarnings } =
			this.convertFromAiSdkToYandex(options.prompt);
		const { tools, warnings: toolWarnings } = this.convertTools(options.tools);
		const po = options.providerOptions as YandexChatProviderOptions | undefined;
		const body: YandexCompletionRequest = {
			modelUri: `gpt://${this.folderId}/${this.modelId}`,
			completionOptions: {
				stream,
				temperature: options.temperature,
				maxTokens: options.maxOutputTokens,
				reasoningOptions: po?.reasoningOptions,
			},
			messages,
			tools,
			jsonSchema:
				options.responseFormat?.type === "json"
					? options.responseFormat.schema
					: undefined,
			toolChoice: options.toolChoice
				? this.convertToolChoice(options.toolChoice)
				: undefined,
			parallelToolCalls: po?.parallelToolCalls,
		};
		const response = await fetch(
			"https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
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

		return {
			warnings: [...messageWarnings, ...toolWarnings],
			response,
		};
	}

	private convertUsage(
		yandexUsage: YandexCompletionResponse["usage"],
	): LanguageModelV3Usage {
		return {
			inputTokens: {
				total: Number.parseInt(yandexUsage.inputTextTokens, 10),
				noCache: Number.parseInt(yandexUsage.inputTextTokens, 10),
				cacheRead: 0,
				cacheWrite: 0,
			},
			outputTokens: {
				total: Number.parseInt(yandexUsage.completionTokens, 10),
				text: Number.parseInt(yandexUsage.completionTokens, 10),
				reasoning: 0,
			},
		};
	}

	async doGenerate(
		options: LanguageModelV3CallOptions,
	): Promise<LanguageModelV3GenerateResult> {
		const { response, warnings } = await this.request(false, options);

		const data = (await response.json()) as {
			result: YandexCompletionResponse;
		};
		const { finishReason, content } = this.convertFromYandexToAiSdk(
			data.result.alternatives,
		);
		return {
			content,
			finishReason,
			usage: this.convertUsage(data.result.usage),
			warnings,
		};
	}

	async doStream(
		options: LanguageModelV3CallOptions,
	): Promise<LanguageModelV3StreamResult> {
		const { response, warnings } = await this.request(true, options);
		if (!response.body) throw new Error("No body");

		let lastFinishReason: LanguageModelV3FinishReason = {
			raw: undefined,
			unified: "stop",
		};
		let usage: LanguageModelV3Usage = {
			inputTokens: {
				total: 0,
				noCache: 0,
				cacheRead: 0,
				cacheWrite: 0,
			},
			outputTokens: {
				total: 0,
				text: 0,
				reasoning: 0,
			},
		};

		const transformedStream = response.body.pipeThrough(
			new TransformStream<Uint8Array, LanguageModelV3StreamPart>({
				start(controller) {
					controller.enqueue({ type: "stream-start", warnings });
				},
				transform: (chunk, controller) => {
					const u8a = chunk;
					const str = Buffer.from(u8a).toString();

					if (options.includeRawChunks) {
						controller.enqueue({ type: "raw", rawValue: str });
					}

					const data = JSON.parse(str) as {
						result: YandexCompletionResponse;
					};

					if (data.result.usage) {
						usage = this.convertUsage(data.result.usage);
					}

					const { content, finishReason } = this.convertFromYandexToAiSdk(
						data.result.alternatives,
					);
					lastFinishReason = finishReason;

					for (const part of content) {
						if (part.type === "text") {
							controller.enqueue({
								type: "text-delta",
								id: "0",
								delta: part.text,
							});
						} else if (part.type === "tool-call") {
							controller.enqueue({
								type: "tool-input-start",
								id: part.toolCallId,
								toolName: part.toolName,
							});

							controller.enqueue({
								type: "tool-input-end",
								id: part.toolCallId,
							});

							controller.enqueue({
								type: "tool-call",
								toolCallId: part.toolCallId,
								toolName: part.toolName,
								input: part.input,
							});
						}
					}
				},
				flush: (controller) => {
					controller.enqueue({ type: "text-end", id: "0" });
					controller.enqueue({
						type: "finish",
						finishReason: lastFinishReason,
						usage: usage,
					});
				},
			}),
		);

		return {
			stream: transformedStream,
		};
	}
}
