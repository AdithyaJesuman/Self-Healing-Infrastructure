// src/routes/CausalGraphStudio.tsx
import React, { useState, useEffect } from 'react';
import { Title, Text, Stack, Group, Badge, Select, Button, Paper, Grid, Card } from '@mantine/core';
import axios from 'axios';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';

export default function CausalGraphStudio() {
  const [selectedService, setSelectedService] = useState<string | null>('payment-api');
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchCausalData = async (srvName: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/causal-graph/traverse?service=${srvName}`);
      if (res.data) {
        setGraphData(res.data);
      }
    } catch (e) {
      console.error('Causal graph error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedService) {
      fetchCausalData(selectedService);
    }
  }, [selectedService]);

  return (
    <PageTransition>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" mb="xs">
              <Badge variant="filled" color="indigo">Neo4j Causal Graph</Badge>
              <Badge variant="outline" color="gray">Granger Causality & Blast Radius</Badge>
            </Group>
            <Title order={2} c="white">Causal Knowledge Graph & RCA Traversal Studio</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Causal discovery using lag-1 cross-correlation Granger causality algorithms to isolate root causes and blast radius across microservices.
            </Text>
          </div>
          <Select
            placeholder="Select Target Service"
            data={[
              { value: 'payment-api', label: 'payment-api' },
              { value: 'order-service', label: 'order-service' },
              { value: 'inventory-service', label: 'inventory-service' },
              { value: 'gateway-service', label: 'gateway-service' },
            ]}
            value={selectedService}
            onChange={setSelectedService}
            styles={{ input: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', width: 220 } }}
          />
        </Group>

        <Grid gutter="md">
          {/* Node Summary */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <GlassCard glowColor="#6366F1">
              <Stack gap="md">
                <Title order={4} c="white">Causal Node Analysis</Title>
                {graphData ? (
                  <Stack gap="xs">
                    <Paper p="xs" radius="md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Text size="xs" c="dimmed">Target Microservice</Text>
                      <Text size="sm" fw={700} c="cyan">{graphData.target_service}</Text>
                    </Paper>

                    <Paper p="xs" radius="md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Text size="xs" c="dimmed">Granger Causality Score</Text>
                      <Text size="sm" fw={700} c="teal">{(graphData.granger_causality_score * 100).toFixed(1)}%</Text>
                    </Paper>

                    <Paper p="xs" radius="md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Text size="xs" c="dimmed">Calculated Blast Radius</Text>
                      <Text size="sm" fw={700} c="red">{graphData.blast_radius_percentage}% of Cluster</Text>
                    </Paper>

                    <Paper p="xs" radius="md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Text size="xs" c="dimmed">Proven Fix Pattern</Text>
                      <Text size="xs" fw={600} c="violet">{graphData.proven_historical_fix}</Text>
                    </Paper>
                  </Stack>
                ) : (
                  <Text size="xs" c="dimmed">Loading causal graph node metrics...</Text>
                )}
              </Stack>
            </GlassCard>
          </Grid.Col>

          {/* Upstream & Downstream Graph Visualizer */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <GlassCard glowColor="#38BDF8">
              <Stack gap="md">
                <Title order={4} c="white">Upstream Callers & Downstream Dependencies</Title>

                {graphData ? (
                  <Grid gutter="md">
                    <Grid.Col span={6}>
                      <Paper p="md" radius="md" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        <Text size="xs" fw={700} c="cyan" mb="xs">⬆️ UPSTREAM AFFECTED CALLERS</Text>
                        {graphData.upstream_affected_callers.length === 0 ? (
                          <Text size="xs" c="dimmed">No upstream dependencies</Text>
                        ) : (
                          graphData.upstream_affected_callers.map((up: string, i: number) => (
                            <Badge key={i} size="sm" color="cyan" variant="outline" style={{ margin: 4 }}>
                              {up}
                            </Badge>
                          ))
                        )}
                      </Paper>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Paper p="md" radius="md" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <Text size="xs" fw={700} c="violet" mb="xs">⬇️ DOWNSTREAM DEPENDENCIES</Text>
                        {graphData.downstream_dependencies.length === 0 ? (
                          <Text size="xs" c="dimmed">No downstream dependencies</Text>
                        ) : (
                          graphData.downstream_dependencies.map((down: string, i: number) => (
                            <Badge key={i} size="sm" color="violet" variant="outline" style={{ margin: 4 }}>
                              {down}
                            </Badge>
                          ))
                        )}
                      </Paper>
                    </Grid.Col>
                  </Grid>
                ) : (
                  <Text size="xs" c="dimmed">Select a service to traverse the causal graph.</Text>
                )}
              </Stack>
            </GlassCard>
          </Grid.Col>
        </Grid>
      </Stack>
    </PageTransition>
  );
}
