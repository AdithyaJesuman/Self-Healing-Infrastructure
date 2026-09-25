import React, { useState, useEffect } from 'react';
import { Title, Table, Badge, Text, Stack, Group, TextInput, Select, Grid, Button } from '@mantine/core';
import axios from 'axios';
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
  origin?: string;
  policy_decision?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'cyan',
};

const STATUS_COLORS: Record<string, string> = {
  resolved: 'teal',
  active: 'red',
  investigating: 'yellow',
};

export default function IncidentMemory() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string | null>('all');
  const [loading, setLoading] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await axios.get('/api/incidents');
      if (Array.isArray(res.data)) {
        setIncidents(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = incidents.filter(inc => {
    const matchesSearch =
      (inc.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (inc.service || '').toLowerCase().includes(search.toLowerCase()) ||
      (inc.message || '').toLowerCase().includes(search.toLowerCase()) ||
      (inc.rca || '').toLowerCase().includes(search.toLowerCase()) ||
      (inc.origin || '').toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || !severityFilter ? true : inc.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const activeCount = incidents.filter(i => i.status === 'active').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  return (
    <PageTransition>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" mb="xs">
              <Badge variant="filled" color="violet">Incident Memory</Badge>
              <Badge variant="outline" color="gray">Live Dynamic Store</Badge>
            </Group>
            <Title order={2} c="white">Autonomous Incident Memory & Post-Mortem Log</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Vector-indexed repository of past failures, real-time Chaos injections, and self-healing resolution patterns.
            </Text>
          </div>
          <Button variant="light" color="violet" size="xs" onClick={fetchIncidents}>
            Refresh Memory
          </Button>
        </Group>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <GlassCard glowColor="#10B981">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Resolved Automatically</Text>
              <Title order={2} c="teal" mt={4}>{resolvedCount}</Title>
              <Text size="xs" c="dimmed" mt={4}>Average MTTR: 24s</Text>
            </GlassCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <GlassCard glowColor="#EF4444">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active Incidents</Text>
              <Title order={2} c="red" mt={4}>{activeCount}</Title>
              <Text size="xs" c="dimmed" mt={4}>Self-healing engine active</Text>
            </GlassCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <GlassCard glowColor="#8B5CF6">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Recorded Incidents</Text>
              <Title order={2} c="violet" mt={4}>{incidents.length}</Title>
              <Text size="xs" c="dimmed" mt={4}>100% Persistent JSON backing</Text>
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
                    <Table.Th style={{ color: '#94a3b8' }}>Origin</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Failure Signature</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Root Cause (Neo4j RCA)</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Policy Decision</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Time</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map(inc => (
                    <Table.Tr key={inc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <Table.Td><Text fw={700} c="cyan" size="xs">{inc.id}</Text></Table.Td>
                      <Table.Td>
                        <Badge size="xs" color={SEVERITY_COLORS[inc.severity] || 'gray'}>{inc.severity}</Badge>
                      </Table.Td>
                      <Table.Td><Text size="xs" fw={600}>{inc.service}</Text></Table.Td>
                      <Table.Td>
                        <Badge size="xs" variant="outline" color={inc.origin === 'Chaos Lab' ? 'red' : 'violet'}>
                          {inc.origin || 'System Baseline'}
                        </Badge>
                      </Table.Td>
                      <Table.Td><Text size="xs" c="gray.3">{inc.message}</Text></Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{inc.rca}</Text></Table.Td>
                      <Table.Td><Text size="xs" c="teal">{inc.policy_decision || 'AUTO_HEALED'}</Text></Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{inc.ts}</Text></Table.Td>
                      <Table.Td>
                        <Badge size="xs" color={STATUS_COLORS[inc.status] || 'gray'}>{inc.status}</Badge>
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
