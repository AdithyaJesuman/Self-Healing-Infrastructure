// src/hooks/useSSE.ts
import { useEffect, useState } from 'react';

/**
 * Generic hook for consuming Server‑Sent Events.
 * @param endpoint API endpoint that returns an EventSource stream (e.g. '/api/stream/metrics')
 * @returns latest data received from the stream
 */
export default function useSSE<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const es = new EventSource(endpoint);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as T;
        setData(parsed);
      } catch (e) {
        // ignore parse errors
      }
    };
    es.onerror = () => {
      setError('SSE connection error');
      es.close();
    };
    return () => {
      es.close();
    };
  }, [endpoint]);

  return { data, error };
}
