import React, { useState } from 'react';
import { Title, Table, Badge, Text, Stack, Group, TextInput, Select, Paper, Grid } from '@mantine/core';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';

interface Incident {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  service: string;
  message: string;
  rca: string;
  ts: string;
  duration: string;
  status: 'resolved' | 'active' | 'investigating';
}

const INITIAL_INCIDENTS: Incident[] = [
  { id: 'INC-809', severity: 'critical', service: 'api-gateway', message: 'CPU Throttling spike > 96%', rca: 'Cryptographic hash loop in auth middleware', ts: '10 mins ago', duration: '45s', status: 'resolved' },
  { id: 'INC-808', severity: 'high', service: 'kafka', message: 'Consumer group lag > 14,200 records', rca: 'Slow disk I/O on broker partition #2', ts: '35 mins ago', duration: '2m 10s', status: 'resolved' },
  { id: 'INC-807', severity: 'critical', service: 'neo4j', message: 'Graph traversal query timeout', rca: 'Unindexed circular dependency relationship', ts: '2 hours ago', duration: 'Ongoing', status: 'active' },
  { id: 'INC-806', severity: 'medium', service: 'influxdb', message: 'Write batch latency > 450ms', rca: 'Compaction cycle concurrency lock', ts: '5 hours ago', duration: '1m 20s', status: 'resolved' },
  { id: 'INC-805', severity: 'low', service: 'grafana', message: 'Dashboard asset slow rendering', rca: 'Client-side query interval set to 500ms', ts: 'Yesterday', duration: '15m', status: 'investigating' },
  { id: 'INC-804', severity: 'high', service: 'chromadb', message: 'Vector similarity query latency spike', rca: 'HNSW index rebuild triggered during peak load', ts: '2 days ago', duration: '4m 30s', status: 'resolved' },
];

const SEVERITY_COLORS = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'cyan',
};

const STATUS_COLORS = {
  resolved: 'teal',
  active: 'red',
  investigating: 'yellow',
};

export default function IncidentMemory() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string | null>('all');

  const filtered = INITIAL_INCIDENTS.filter(inc => {
    const matchesSearch = inc.id.toLowerCase().includes(search.toLowerCase()) ||
      inc.service.toLowerCase().includes(search.toLowerCase()) ||
      inc.message.toLowerCase().includes(search.toLowerCase()) ||
      inc.rca.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || !severityFilter ? true : inc.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const activeCount = INITIAL_INCIDENTS.filter(i => i.status === 'active').length;
  const resolvedCount = INITIAL_INCIDENTS.filter(i => i.status === 'resolved').length;

  return (
    <PageTransition>
      <Stack gap="xl">
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="filled" color="violet">Incident Memory</Badge>
            <Badge variant="outline" color="gray">Knowledge Base & RCA</Badge>
          </Group>
          <Title order={2} c="white">Autonomous Incident Memory & Post-Mortem Log</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Vector-indexed repository of past failures, root-cause analyses (RCA), and self-healing resolution patterns.
          </Text>
        </div>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <GlassCard glowColor="#10B981">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Resolved Automatically</Text>
              <Title order={2} c="teal" mt={4}>{resolvedCount}</Title>
              <Text size="xs" c="dimmed" mt={4}>Average MTTR: 1m 18s</Text>
            </GlassCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <GlassCard glowColor="#EF4444">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active Incidents</Text>
              <Title order={2} c="red" mt={4}>{activeCount}</Title>
              <Text size="xs" c="dimmed" mt={4}>Self-healing runbook engaged</Text>
            </GlassCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <GlassCard glowColor="#8B5CF6">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>RCA Graph Coverage</Text>
              <Title order={2} c="violet" mt={4}>98.4%</Title>
              <Text size="xs" c="dimmed" mt={4}>Vector matching similarity &gt; 0.88</Text>
            </GlassCard>
          </Grid.Col>
        </Grid>

        <GlassCard>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="sm">
                <TextInput
                  placeholder="Search incidents, services, RCA..."
                  value={search}
                  onChange={e => setSearch(e.currentTarget.value)}
                  styles={{ input: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', width: 280 } }}
                />
                <Select
                  placeholder="Filter by severity"
                  data={[
                    { value: 'all', label: 'All Severities' },
                    { value: 'critical', label: 'Critical' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                  ]}
                  value={severityFilter}
                  onChange={setSeverityFilter}
                  styles={{ input: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' } }}
                />
              </Group>
              <Badge variant="dot" color="teal">{filtered.length} matching events</Badge>
            </Group>

            <div style={{ overflowX: 'auto' }}>
              <Table highlightOnHover style={{ color: '#fff', minWidth: 700 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: '#94a3b8' }}>ID</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Severity</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Service</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Failure Signature</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Root Cause (Neo4j RCA)</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Time</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map(inc => (
                    <Table.Tr key={inc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <Table.Td><Text fw={700} c="cyan" size="xs">{inc.id}</Text></Table.Td>
                      <Table.Td>
                        <Badge size="xs" color={SEVERITY_COLORS[inc.severity]}>{inc.severity}</Badge>
                      </Table.Td>
                      <Table.Td><Text size="xs" fw={600}>{inc.service}</Text></Table.Td>
                      <Table.Td><Text size="xs" c="gray.3">{inc.message}</Text></Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{inc.rca}</Text></Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{inc.ts}</Text></Table.Td>
                      <Table.Td>
                        <Badge size="xs" color={STATUS_COLORS[inc.status]}>{inc.status}</Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </Stack>
        </GlassCard>
      </Stack>
    </PageTransition>
  );
}
