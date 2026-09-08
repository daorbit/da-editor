import { AI_SYSTEM_PROMPT } from '../constants';
import type { AiConfig, ComposeRequest } from '../types';

function buildUserPrompt(req: ComposeRequest): string {
  const parts: string[] = [];
  if (req.context?.trim()) {
    parts.push(`Document so far:\n"""\n${req.context.trim()}\n"""`);
  }
  if (req.selection?.trim()) {
    parts.push(`Selected text to rework:\n"""\n${req.selection.trim()}\n"""`);
  }
  parts.push(`Instruction:\n${req.prompt.trim()}`);
  return parts.join('\n\n');
}

async function readError(res: Response): Promise<string> {
  let detail = '';
  try {
    const data = await res.json();
    detail =
      data?.error?.message ||
      data?.error?.[0]?.message ||
      data?.errors?.[0]?.message ||
      data?.message ||
      '';
  } catch {
    detail = await res.text().catch(() => '');
  }
  return detail ? `${res.status} ${detail}` : `Request failed with ${res.status}`;
}

async function openAiCompatible(
  endpoint: string,
  headers: Record<string, string>,
  config: AiConfig,
  req: ComposeRequest,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    signal,
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(req) },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('The model returned an empty response');
  return String(text).trim();
}

async function anthropic(
  config: AiConfig,
  req: ComposeRequest,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2048,
      system: AI_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(req) }],
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('The model returned an empty response');
  return String(text).trim();
}

async function gemini(
  config: AiConfig,
  req: ComposeRequest,
  signal?: AbortSignal
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    config.model
  )}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: AI_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: buildUserPrompt(req) }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') ?? '';
  if (!text.trim()) throw new Error('The model returned an empty response');
  return text.trim();
}

export function runCompose(
  config: AiConfig,
  req: ComposeRequest,
  signal?: AbortSignal
): Promise<string> {
  switch (config.provider) {
    case 'openai':
      return openAiCompatible(
        'https://api.openai.com/v1/chat/completions',
        { authorization: `Bearer ${config.apiKey}` },
        config,
        req,
        signal
      );
    case 'groq':
      return openAiCompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        { authorization: `Bearer ${config.apiKey}` },
        config,
        req,
        signal
      );
    case 'openrouter':
      return openAiCompatible(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          authorization: `Bearer ${config.apiKey}`,
          'http-referer': window.location.origin,
          'x-title': 'da-editor playground',
        },
        config,
        req,
        signal
      );
    case 'anthropic':
      return anthropic(config, req, signal);
    case 'gemini':
      return gemini(config, req, signal);
    default:
      return Promise.reject(new Error('Unknown provider'));
  }
}
