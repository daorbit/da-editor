import { useCallback, useEffect, useRef, useState } from 'react';
import { runCompose } from '../lib/providers';
import type { AiConfig, ComposeRequest } from '../types';

export function useAiCompose(config: AiConfig | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  const compose = useCallback(
    async (req: ComposeRequest): Promise<string | null> => {
      if (!config) {
        setError('Add an AI provider first');
        return null;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        return await runCompose(config, req, controller.signal);
      } catch (err) {
        if (controller.signal.aborted) return null;
        setError(err instanceof Error ? err.message : 'Could not generate content');
        return null;
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setLoading(false);
      }
    },
    [config]
  );

  return { compose, cancel, loading, error, setError };
}
