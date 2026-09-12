// Overview.tsx
import React from 'react';
import { Title, Text, Stack, Grid, Group, Badge, Button, Paper, SimpleGrid } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';

export default function Overview() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <Stack gap="xl">
        {/* Hero Section */}
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs" style={{ maxWidth: 640 }}>
              <Group gap="xs">
                <Badge variant="filled" color="cyan">Autonomous AIOps v2.4</Badge>
                <Badge variant="outline" color="green">All Systems Operational</Badge>
              </Group>
              <Title order={1} c="white" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Mission Critical Infrastructure & Autonomous Self-Healing
              </Title>
              <Text c="gray.4" size="md" lh={1.6}>
                Real-time event streaming, statistical anomaly detection, Neo4j causal root-cause analysis, and automated self-healing remediation.
              </Text>
              <Group gap="sm" mt="md">
                <Button color="cyan" size="md" onClick={() => navigate('/dashboard')} styles={{ root: { boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.39)' } }}>
                  Open Live Telemetry
                </Button>
                <Button variant="outline" color="gray" size="md" onClick={() => navigate('/chaos')} styles={{ root: { color: '#fff', borderColor: 'rgba(255,255,255,0.2)' } }}>
                  Simulate Outage (Chaos)
                </Button>
                <Button variant="subtle" color="teal" size="md" onClick={() => navigate('/tests')}>
                  Run QA Checks
                </Button>
              </Group>
            </Stack>

            <Paper p="lg" radius="md" style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', minWidth: 220 }}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>System Health Index</Text>
              <Title order={1} c="teal" mt={4}>99.98%</Title>
              <Text size="xs" c="dimmed" mt={4}>Zero unhandled anomalies</Text>
              <Group gap={6} mt="md">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <Text size="xs" c="white" fw={600}>AI Auto-Pilot: Engaged</Text>
              </Group>
            </Paper>
          </Group>
        </Paper>

        {/* Quick Platform Metrics Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <GlassCard glowColor="#06B6D4">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Ingested Telemetry</Text>
            <Title order={2} c="white" mt={4}>1.84M</Title>
            <Text size="xs" c="cyan" mt={2}>Events processed / hr</Text>
          </GlassCard>

          <GlassCard glowColor="#10B981">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Auto-Remediated</Text>
            <Title order={2} c="white" mt={4}>99.2%</Title>
            <Text size="xs" c="teal" mt={2}>Zero-touch incident resolution</Text>
          </GlassCard>

          <GlassCard glowColor="#8B5CF6">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Mean Time to Recovery</Text>
            <Title order={2} c="white" mt={4}>38s</Title>
            <Text size="xs" c="violet" mt={2}>Down from 45m baseline</Text>
          </GlassCard>

          <GlassCard glowColor="#F59E0B">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active Monitored Nodes</Text>
            <Title order={2} c="white" mt={4}>24</Title>
            <Text size="xs" c="yellow" mt={2}>Microservices & DB partitions</Text>
          </GlassCard>
        </SimpleGrid>

        {/* Architecture Services Topology */}
        <GlassCard>
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={3} c="white">Infrastructure Mesh Topology</Title>
                <Text size="xs" c="dimmed">Core microservices coordinated by the autonomous platform.</Text>
              </div>
              <Badge color="cyan" variant="light">6 Services Online</Badge>
            </Group>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Paper p="md" radius="md" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Group justify="space-between">
                    <Text size="sm" fw={700} c="white">FastAPI Gateway</Text>
                    <Badge size="xs" color="teal">Port 8001</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>High-throughput REST and Server-Sent Event (SSE) ingestion hub.</Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Paper p="md" radius="md" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Group justify="space-between">
                    <Text size="sm" fw={700} c="white">Apache Kafka</Text>
                    <Badge size="xs" color="teal">Port 9092</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>Distributed event streaming bus handling high-volume metric ingestion.</Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Paper p="md" radius="md" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Group justify="space-between">
                    <Text size="sm" fw={700} c="white">InfluxDB 2.x</Text>
                    <Badge size="xs" color="teal">Port 8086</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>Time-series metric storage with high write throughput and downsampling.</Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Paper p="md" radius="md" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Group justify="space-between">
                    <Text size="sm" fw={700} c="white">Neo4j Graph Database</Text>
                    <Badge size="xs" color="teal">Port 7474</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>Dependency mapping and causal graph traversal for Root-Cause Analysis (RCA).</Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Paper p="md" radius="md" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Group justify="space-between">
                    <Text size="sm" fw={700} c="white">ChromaDB Vector Store</Text>
                    <Badge size="xs" color="teal">Port 8000</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>Incident memory embeddings and similarity search for historical remediation patterns.</Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Paper p="md" radius="md" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Group justify="space-between">
                    <Text size="sm" fw={700} c="white">Grafana Dashboards</Text>
                    <Badge size="xs" color="teal">Port 3000</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>Advanced exploratory metrics analysis, alerting rules, and telemetry views.</Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        </GlassCard>
      </Stack>
    </PageTransition>
  );
}

