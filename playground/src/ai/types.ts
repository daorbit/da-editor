export type AiProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'groq'
  | 'openrouter';

export interface AiModelOption {
  id: string;
  label: string;
}

export interface AiProviderMeta {
  id: AiProviderId;
  label: string;
  keyLabel: string;
  keyPlaceholder: string;
  keyHint: string;
  docsUrl: string;
  models: AiModelOption[];
}

export interface AiConfig {
  provider: AiProviderId;
  model: string;
  apiKey: string;
}

export type ComposeMode = 'insert' | 'replace';

export interface ComposeRequest {
  prompt: string;
  selection?: string;
  context?: string;
}

export interface ComposeResult {
  text: string;
  mode: ComposeMode;
}
