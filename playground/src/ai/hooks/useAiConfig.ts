import { useCallback, useEffect, useState } from 'react';
import { AI_CONFIG_STORAGE_KEY } from '../constants';
import { clearAiConfig, readAiConfig, writeAiConfig } from '../storage';
import type { AiConfig } from '../types';

export function useAiConfig() {
  const [config, setConfig] = useState<AiConfig | null>(() => readAiConfig());

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === AI_CONFIG_STORAGE_KEY) setConfig(readAiConfig());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const save = useCallback((next: AiConfig) => {
    writeAiConfig(next);
    setConfig(next);
  }, []);

  const clear = useCallback(() => {
    clearAiConfig();
    setConfig(null);
  }, []);

  return { config, isConfigured: config !== null, save, clear };
}
