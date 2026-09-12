import { useEffect, useState } from 'react';

export interface MetricRecord {
  timestamp: string;
  cpu: number;
  memory: number;
  latency: number;
  errors: number;
  requests: number;
}

function genMetric(): MetricRecord {
  return {
    timestamp: new Date().toISOString(),
    cpu: Math.round(20 + Math.random() * 60),
    memory: Math.round(400 + Math.random() * 600),
    latency: Math.round(50 + Math.random() * 200),
    errors: Math.round(Math.random() * 10),
    requests: Math.round(100 + Math.random() * 500),
  };
}

export function useMockMetrics(intervalMs = 2000) {
  const [metrics, setMetrics] = useState<MetricRecord[]>(() =>
    Array.from({ length: 20 }, genMetric)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(prev => [...prev, genMetric()].slice(-60));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return metrics;
}
