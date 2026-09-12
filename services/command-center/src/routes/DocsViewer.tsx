import React from 'react';
import { Title, Stack, Text, Paper, Code, Grid, Badge, Group, Divider, ThemeIcon } from '@mantine/core';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';

export default function DocsViewer() {
  return (
    <PageTransition>
      <Stack gap="xl">
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="filled" color="cyan">Platform Architecture</Badge>
            <Badge variant="outline" color="gray">v2.4 Production</Badge>
          </Group>
          <Title order={2} c="white">AIOps Autonomous Operations & Monitoring</Title>
          <Text c="dimmed" size="sm" mt={4}>
            How the autonomous self-healing monitoring pipeline processes metrics, identifies anomalies, and takes automated action.
          </Text>
        </div>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <GlassCard glowColor="#06B6D4">
              <Title order={4} c="cyan" mb="xs">1. Data Ingestion Pipeline</Title>
              <Text size="sm" c="gray.3" lh={1.6}>
                Infrastructure services emit real-time telemetry (CPU, Memory, Latency, Error Rates) into <strong>Apache Kafka</strong> on topic <Code c="cyan">system.metrics</Code>. Telemetry is written directly to <strong>InfluxDB</strong> time-series store and streamed live to the UI via Server-Sent Events (SSE).
              </Text>
              <Divider my="sm" color="rgba(255,255,255,0.08)" />
              <Text size="xs" c="dimmed">
                • <strong>Port 9092:</strong> Kafka Broker & Consumer Group Coordinator<br/>
                • <strong>Port 8086:</strong> InfluxDB Time-Series Engine<br/>
                • <strong>Port 8001:</strong> FastAPI Gateway with EventSource SSE
              </Text>
            </GlassCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <GlassCard glowColor="#8B5CF6">
              <Title order={4} c="violet" mb="xs">2. Anomaly Detection & RCA</Title>
              <Text size="sm" c="gray.3" lh={1.6}>
                The AI Anomaly Detector computes sliding-window statistical z-scores and isolation forests. When an anomaly breaches thresholds (e.g. CPU &gt; 90% or consumer lag &gt; 5000), a root-cause graph query executes in <strong>Neo4j</strong> to trace causal dependencies.
              </Text>
              <Divider my="sm" color="rgba(255,255,255,0.08)" />
              <Text size="xs" c="dimmed">
                • <strong>Port 7474:</strong> Neo4j Graph Database (Topology & Dependency Graphs)<br/>
                • <strong>Port 8000:</strong> ChromaDB Vector Store for Historical Incidents
              </Text>
            </GlassCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <GlassCard glowColor="#10B981">
              <Title order={4} c="teal" mb="xs">3. Autonomous Remediation</Title>
              <Text size="sm" c="gray.3" lh={1.6}>
                Once root cause is isolated, the autonomous agent executes remediation playbooks: dynamic pod scaling, consumer partition rebalancing, cache invalidation, or rolling restarts, preventing human incident escalation.
              </Text>
              <Divider my="sm" color="rgba(255,255,255,0.08)" />
              <Text size="xs" c="dimmed">
                • Actions logged to Incident Memory database<br/>
                • Real-time SSE alert broadcasted to command dashboard
              </Text>
            </GlassCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <GlassCard glowColor="#F59E0B">
              <Title order={4} c="yellow" mb="xs">4. Chaos Testing & Resilience</Title>
              <Text size="sm" c="gray.3" lh={1.6}>
                Use the <strong>Chaos Panel</strong> to inject simulated outages (CPU Spikes, Memory Leaks, Kafka Lags). The platform immediately reflects the anomaly, logs an incident, and validates that recovery triggers fire automatically.
              </Text>
              <Divider my="sm" color="rgba(255,255,255,0.08)" />
              <Text size="xs" c="dimmed">
                • Synthetic load generator verifies zero downtime<br/>
                • Automated test suite in "Run Tests" validates all microservices
              </Text>
            </GlassCard>
          </Grid.Col>
        </Grid>

        <Paper p="lg" radius="md" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Title order={4} c="white" mb="sm">Core Endpoints & API Reference</Title>
          <Code block style={{ background: 'rgba(0,0,0,0.6)', padding: '16px', borderRadius: '8px', color: '#67e8f9', fontSize: '13px', lineHeight: 1.8 }}>
{`GET  /health              -> Microservice status and DB connectivity check
GET  /stream/metrics      -> Real-time SSE metric stream (CPU, Memory, IO, Requests)
GET  /stream/anomalies    -> Real-time SSE anomaly events detected by AI
GET  /stream/actions      -> Real-time SSE remediation actions executed
GET  /api/incidents       -> Historical incident archive and RCA causality
POST /api/inject          -> Chaos injection: { type: "cpu_spike", service: "api-gateway" }
POST /api/run-qa-tests    -> Execute automated end-to-end integration test runner`}
          </Code>
        </Paper>
      </Stack>
    </PageTransition>
  );
}
