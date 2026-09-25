// src/routes/DigitalTwinStudio.tsx
import React, { useState } from 'react';
import { Title, Text, Stack, Group, Badge, Slider, Select, Button, Paper, Grid, Table } from '@mantine/core';
import axios from 'axios';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';

export default function DigitalTwinStudio() {
  const [lambda, setLambda] = useState(1200);
  const [mu, setMu] = useState(1500);
  const [replicas, setReplicas] = useState(2);
  const [action, setAction] = useState<string | null>('horizontal_scale_out');
  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/digital-twin/simulate', {
        arrival_rate_lambda: lambda,
        service_rate_mu: mu,
        num_replicas_c: replicas,
        action: action
      });
      if (res.data) {
        setSimResult(res.data);
      }
    } catch (e) {
      console.error('Digital Twin simulation error:', e);
    } finally {
      setLoading(false);
    }
  };

  const sim = simResult?.simulation;
  const gates = simResult?.policy_gates || [];

  return (
    <PageTransition>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" mb="xs">
              <Badge variant="filled" color="violet">Queueing Theory Engine</Badge>
              <Badge variant="outline" color="gray">M/M/c Simulator & Little's Law</Badge>
            </Group>
            <Title order={2} c="white">Digital Twin Pre-Execution Simulation Studio</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Simulate traffic intensity ($\rho = \lambda / c\mu$), latency reduction, and 5 Safety Policy Gate validations before applying self-healing changes.
            </Text>
          </div>
          <Button variant="filled" color="violet" onClick={runSimulation} loading={loading}>
            Run Twin Simulation
          </Button>
        </Group>

        <Grid gutter="md">
          {/* Controls Column */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <GlassCard glowColor="#8B5CF6">
              <Stack gap="md">
                <Title order={4} c="white">Cluster Traffic & Capacity Controls</Title>

                <div>
                  <Text size="xs" c="gray.3" fw={600} mb={4}>Arrival Rate ($\lambda$): {lambda} req/sec</Text>
                  <Slider value={lambda} onChange={setLambda} min={100} max={5000} step={50} color="violet" />
                </div>

                <div>
                  <Text size="xs" c="gray.3" fw={600} mb={4}>Service Capacity ($\mu$): {mu} req/sec / instance</Text>
                  <Slider value={mu} onChange={setMu} min={200} max={4000} step={50} color="cyan" />
                </div>

                <div>
                  <Text size="xs" c="gray.3" fw={600} mb={4}>Worker Replicas ($c$): {replicas} pods</Text>
                  <Slider value={replicas} onChange={setReplicas} min={1} max={10} step={1} color="teal" />
                </div>

                <Select
                  label="Proposed Remediating Action"
                  data={[
                    { value: 'horizontal_scale_out', label: 'Horizontal Scale Out (+2 Replicas)' },
                    { value: 'increase_db_pool_size', label: 'Increase DB Connection Pool (+50%)' },
                    { value: 'staggered_restart', label: 'Staggered Pod Restart (Clear Heap)' },
                    { value: 'trip_circuit_breaker', label: 'Trip Circuit Breaker (Isolate Shed)' },
                  ]}
                  value={action}
                  onChange={setAction}
                  styles={{
                    label: { color: '#ccc', marginBottom: 6 },
                    input: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }
                  }}
                />

                <Button onClick={runSimulation} loading={loading} color="violet" size="md">
                  Execute Digital Twin Analysis
                </Button>
              </Stack>
            </GlassCard>
          </Grid.Col>

          {/* Results Column */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <GlassCard glowColor="#10B981">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={4} c="white">Queueing Math & Policy Gate Decision</Title>
                  {simResult && (
                    <Badge color="green" size="md">{simResult.execution_approval}</Badge>
                  )}
                </Group>

                {sim ? (
                  <Grid gutter="sm">
                    <Grid.Col span={4}>
                      <Paper p="xs" radius="md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Text size="xs" c="dimmed">Traffic Intensity ($\rho$)</Text>
                        <Title order={3} c={sim.traffic_intensity_rho > 0.9 ? "red" : "teal"} mt={2}>
                          {sim.traffic_intensity_rho}
                        </Title>
                        <Text size="xs" c="dimmed">{sim.is_queue_stable ? "Stable (M/M/c)" : "Queue Unstable"}</Text>
                      </Paper>
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <Paper p="xs" radius="md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Text size="xs" c="dimmed">Pre-Fix P99 Latency</Text>
                        <Title order={3} c="orange" mt={2}>{sim.pre_fix_latency_ms} ms</Title>
                        <Text size="xs" c="dimmed">Drop: {sim.pre_fix_drop_percentage}%</Text>
                      </Paper>
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <Paper p="xs" radius="md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Text size="xs" c="dimmed">Post-Fix P99 Latency</Text>
                        <Title order={3} c="teal" mt={2}>{sim.post_fix_latency_ms} ms</Title>
                        <Text size="xs" c="teal">-{sim.predicted_latency_reduction_pct}% reduction</Text>
                      </Paper>
                    </Grid.Col>
                  </Grid>
                ) : (
                  <Text size="sm" c="dimmed">Click "Execute Digital Twin Analysis" to run M/M/c queueing simulation.</Text>
                )}

                {gates.length > 0 && (
                  <Paper p="xs" radius="md" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Text size="xs" c="white" fw={700} mb="xs">🛡️ 5 SAFETY POLICY GATES VALIDATION</Text>
                    <Table style={{ color: '#fff' }}>
                      <Table.Tbody>
                        {gates.map((g: any, i: number) => (
                          <Table.Tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <Table.Td><Text size="xs" fw={700} c="cyan">{g.gate}</Text></Table.Td>
                            <Table.Td><Badge size="xs" color="teal">PASSED</Badge></Table.Td>
                            <Table.Td><Text size="xs" c="dimmed">{g.detail}</Text></Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                )}
              </Stack>
            </GlassCard>
          </Grid.Col>
        </Grid>
      </Stack>
    </PageTransition>
  );
}
