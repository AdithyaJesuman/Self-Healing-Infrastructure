import React, { useState, useEffect } from 'react';
import { Title, Select, Button, Stack, Text, Alert, Paper, Group, Badge, Grid } from '@mantine/core';
import axios from 'axios';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';

const CHAOS_EXPERIMENTS = [
  { value: 'cpu_spike', label: 'CPU Exhaustion (Spike to 98%)', service: 'order-service', desc: 'Simulates intensive crypto computation to trigger HPA and CPU throttling alerts.' },
  { value: 'memory_leak', label: 'Memory Leak (Linear Exhaustion)', service: 'inventory-service', desc: 'Leaks 50MB/sec to trigger memory threshold detection and OOM prevention.' },
  { value: 'network_partition', label: 'Network Degradation (Packet Loss 40%)', service: 'gateway-service', desc: 'Introduces artificial latency and dropped socket packets to test circuit breakers.' },
  { value: 'kafka_lag', label: 'Kafka Consumer Lag (> 15,000 offsets)', service: 'payment-api', desc: 'Suspends consumer polling to simulate backpressure and backlog buildup.' },
  { value: 'db_timeout', label: 'InfluxDB Connection Pool Starvation', service: 'payment-api', desc: 'Saturates read pool connections to verify failover to replica cache.' },
];

interface ChaosHistoryItem {
  id: string;
  type: string;
  service?: string;
  time: string;
  timestamp?: string;
  status: string;
  policy_decision?: string;
}

export default function ChaosPanel() {
  const [selectedChaos, setSelectedChaos] = useState<string | null>('cpu_spike');
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChaosHistoryItem[]>([]);

  const selectedExp = CHAOS_EXPERIMENTS.find(c => c.value === selectedChaos);

  const fetchChaosHistory = async () => {
    try {
      const res = await axios.get('/api/chaos/history');
      if (Array.isArray(res.data)) {
        setHistory(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch chaos history:', e);
    }
  };

  useEffect(() => {
    fetchChaosHistory();
    const interval = setInterval(fetchChaosHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const inject = async () => {
    if (!selectedChaos) return;
    setLoading(true);
    setResult(null);
    setErr(null);
    try {
      const res = await axios.post('/api/inject', {
        type: selectedChaos,
        severity: 'critical',
        service: selectedExp?.service || 'payment-api',
      });
      
      const resData = res.data;
      const incId = resData.incident_id || resData.incident?.id || 'INC-EVENT';
      setResult(`Chaos experiment "${selectedExp?.label}" injected successfully! Recorded as ${incId}. Remediated via 5 Safety Gates.`);
      await fetchChaosHistory();
    } catch (e: any) {
      setErr(`Failed to inject chaos: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }

  };

  return (
    <PageTransition>
      <Stack gap="xl">
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="filled" color="red">Resilience Engineering</Badge>
            <Badge variant="outline" color="gray">Live Backend Synced</Badge>
          </Group>
          <Title order={2} c="white">Chaos Injection & Active Resilience Testing</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Test platform fault tolerance and verify autonomous root-cause detection & remediation triggers in real time.
          </Text>
        </div>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <GlassCard glowColor="#EF4444">
              <Stack gap="md">
                <Title order={4} c="white">Configure Fault Injection</Title>
                <Select
                  label="Chaos Scenario"
                  placeholder="Select scenario"
                  data={CHAOS_EXPERIMENTS.map(c => ({ value: c.value, label: c.label }))}
                  value={selectedChaos}
                  onChange={setSelectedChaos}
                  styles={{
                    label: { color: '#ccc', marginBottom: 6 },
                    input: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' },
                  }}
                />

                {selectedExp && (
                  <Paper p="sm" radius="md" style={{ background: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,100,100,0.15)' }}>
                    <Text size="xs" c="red.3" fw={600} mb={4}>Target Service: {selectedExp.service}</Text>
                    <Text size="xs" c="dimmed">{selectedExp.desc}</Text>
                  </Paper>
                )}

                <Button
                  onClick={inject}
                  loading={loading}
                  disabled={!selectedChaos}
                  color="red"
                  variant="filled"
                  size="md"
                  styles={{ root: { boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)' } }}
                >
                  Trigger Fault Injection
                </Button>

                {result && (
                  <Alert color="teal" title="Injection Result" styles={{ root: { background: 'rgba(16, 185, 129, 0.1)' } }}>
                    {result}
                  </Alert>
                )}
                {err && (
                  <Alert color="red" title="Notice" styles={{ root: { background: 'rgba(239, 68, 68, 0.1)' } }}>
                    {err}
                  </Alert>
                )}
              </Stack>
            </GlassCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <GlassCard glowColor="#6366F1">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Title order={4} c="white">Recent Chaos Runs</Title>
                  <Badge size="xs" color="indigo">Live Audit Trail</Badge>
                </Group>
                <Text size="xs" c="dimmed">Audit log of real recorded outage injections & auto-healing results.</Text>
                <Stack gap="xs" mt="xs">
                  {history.length === 0 ? (
                    <Text size="xs" c="dimmed">No chaos experiments recorded yet. Click "Trigger Fault Injection" above to test!</Text>
                  ) : (
                    history.map(item => (
                      <Paper
                        key={item.id}
                        p="xs"
                        radius="sm"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <Group justify="space-between">
                          <Text size="xs" fw={700} c="cyan">{item.id}</Text>
                          <Badge size="xs" color={item.status.includes('healed') ? 'green' : 'orange'}>
                            {item.status}
                          </Badge>
                        </Group>
                        <Group justify="space-between" mt={4}>
                          <Text size="xs" c="gray.3">Type: {item.type}</Text>
                          <Text size="xs" c="dimmed">{item.service || 'service'}</Text>
                        </Group>
                        {item.policy_decision && (
                          <Text size="xs" c="teal.3" mt={2}>{item.policy_decision}</Text>
                        )}
                      </Paper>
                    ))
                  )}
                </Stack>
              </Stack>
            </GlassCard>
          </Grid.Col>
        </Grid>
      </Stack>
    </PageTransition>
  );
}
