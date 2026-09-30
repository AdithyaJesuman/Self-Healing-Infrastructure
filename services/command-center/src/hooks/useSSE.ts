// src/hooks/useSSE.ts
import { useEffect, useState, useRef } from 'react';

export type SSEStatus = 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface UseSSEReturn<T> {
  data: T | null;
  error: string | null;
  status: SSEStatus;
  reconnect: () => void;
}

/**
 * Robust, production-grade hook for consuming Server-Sent Events with exponential backoff auto-reconnect.
 */
export default function useSSE<T>(endpoint: string): UseSSEReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SSEStatus>('connecting');
  const retryCountRef = useRef<number>(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const connect = () => {
    if (esRef.current) {
      esRef.current.close();
    }

    setStatus(retryCountRef.current === 0 ? 'connecting' : 'reconnecting');
    const es = new EventSource(endpoint);
    esRef.current = es;

    es.onopen = () => {
      setStatus('connected');
      setError(null);
      retryCountRef.current = 0;
    };

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as T;
        setData(parsed);
      } catch (e) {
        // Ignore parse error on heartbeats or comments
      }
    };

    es.onerror = () => {
      es.close();
      setError('SSE stream disconnected. Retrying...');
      setStatus('reconnecting');

      // Exponential backoff retry: 1s, 2s, 4s, capped at 10s
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
      retryCountRef.current += 1;

      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  };

  useEffect(() => {
    retryCountRef.current = 0;
    connect();

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [endpoint]);

  return { data, error, status, reconnect: connect };
}
