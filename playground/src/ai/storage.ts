import { AI_CONFIG_STORAGE_KEY } from './constants';
import { getProvider } from './constants';
import type { AiConfig } from './types';

function isValid(value: unknown): value is AiConfig {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  if (typeof c.provider !== 'string' || typeof c.model !== 'string' || typeof c.apiKey !== 'string') {
    return false;
  }
  const provider = getProvider(c.provider);
  if (!provider) return false;
  if (!c.apiKey.trim()) return false;
  return true;
}

export function readAiConfig(): AiConfig | null {
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeAiConfig(config: AiConfig): void {
  try {
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* storage unavailable */
  }
}

export function clearAiConfig(): void {
  try {
    localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}
