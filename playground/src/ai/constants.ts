import type { AiProviderMeta } from './types';

export const AI_CONFIG_STORAGE_KEY = 'da-editor.playground.ai.config.v1';

export const AI_SYSTEM_PROMPT =
  'You are a writing assistant embedded in a rich text editor. ' +
  'Reply with clean GitHub-flavored Markdown only. ' +
  'Do not wrap the whole answer in a code fence. ' +
  'Do not add commentary before or after the content.';

export const AI_PROVIDERS: AiProviderMeta[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    keyLabel: 'API key',
    keyPlaceholder: 'sk-...',
    keyHint: 'Created at platform.openai.com/api-keys',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
      { id: 'gpt-4.1', label: 'GPT-4.1' },
      { id: 'o4-mini', label: 'o4-mini' },
    ],
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    keyLabel: 'API key',
    keyPlaceholder: 'sk-ant-...',
    keyHint: 'Created at console.anthropic.com/settings/keys',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
      { id: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    ],
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    keyLabel: 'API key',
    keyPlaceholder: 'AIza...',
    keyHint: 'Free tier at aistudio.google.com/app/apikey (no billing needed)',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (free tier)' },
      { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite (free tier)' },
      { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro (free tier)' },
      { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash (free tier)' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (free tier)' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (free tier)' },
    ],
  },
  {
    id: 'groq',
    label: 'Groq',
    keyLabel: 'API key',
    keyPlaceholder: 'gsk_...',
    keyHint: 'Created at console.groq.com/keys',
    docsUrl: 'https://console.groq.com/keys',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (free)' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (free)' },
      { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B (free)' },
      { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (free)' },
      { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B (free)' },
    ],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    keyLabel: 'API key',
    keyPlaceholder: 'sk-or-...',
    keyHint: 'Created at openrouter.ai/keys',
    docsUrl: 'https://openrouter.ai/keys',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (free)' },
      { id: 'deepseek/deepseek-chat-v3.1:free', label: 'DeepSeek V3.1 (free)' },
      { id: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1 (free)' },
      { id: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash Exp (free)' },
      { id: 'qwen/qwen3-235b-a22b:free', label: 'Qwen3 235B (free)' },
      { id: 'meta-llama/llama-4-maverick:free', label: 'Llama 4 Maverick (free)' },
    ],
  },
];

export function getProvider(id: string) {
  return AI_PROVIDERS.find((p) => p.id === id);
}
