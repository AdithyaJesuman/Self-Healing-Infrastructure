// src/routes/LiveLogIntelligence.tsx
import React, { useState, useEffect } from 'react';
import { Title, Text, Stack, Group, Badge, TextInput, Select, Paper, Table, Button, Code } from '@mantine/core';
import axios from 'axios';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';

interface LogEntry {
  id: string;
  timestamp: string;
  service: string;
  level: string;
  message: string;
  similarity: number;
}

export default function LiveLogIntelligence() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string | null>('all');
  const [levelFilter, setLevelFilter] = useState<string | null>('all');
  const [searching, setSearching] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/logs/stream');
      if (res.data && Array.isArray(res.data.logs)) {
        setLogs(res.data.logs);
      }
    } catch (e) {
      console.debug('Failed to fetch logs:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const res = await axios.post('/api/logs/search', {
        query: search,
        service: serviceFilter,
        level: levelFilter
      });
      if (res.data && Array.isArray(res.data.logs)) {
        setLogs(res.data.logs);
      }
    } catch (e) {
      console.debug('Search error:', e);
    } finally {
      setSearching(false);
    }
  };

  const LEVEL_COLORS: Record<string, string> = {
    CRITICAL: 'red',
    ERROR: 'orange',
    WARNING: 'yellow',
    INFO: 'cyan',
  };

  return (
    <PageTransition>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" mb="xs">
              <Badge variant="filled" color="cyan">ChromaDB Vector Store</Badge>
              <Badge variant="outline" color="gray">Sentence-Transformers AI</Badge>
            </Group>
            <Title order={2} c="white">Cluster Log Intelligence & Semantic Search</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Real-time vector embeddings and semantic search across microservices logs and exception traces.
            </Text>
          </div>
          <Button variant="light" color="cyan" size="xs" onClick={fetchLogs}>
            Refresh Logs Terminal
          </Button>
        </Group>

        <GlassCard glowColor="#06B6D4">
          <Stack gap="md">
            <Group justify="space-between" wrap="wrap">
              <Group gap="sm" style={{ flex: 1, minWidth: 300 }}>
                <TextInput
                  placeholder="Semantic search (e.g. 'connection starvation', 'CPU throttled', 'OOM risk')..."
                  value={search}
                  onChange={e => setSearch(e.currentTarget.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  style={{ flex: 1 }}
                  styles={{ input: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' } }}
                />
                <Select
                  placeholder="Service"
                  data={[
                    { value: 'all', label: 'All Microservices' },
                    { value: 'payment-api', label: 'payment-api' },
                    { value: 'order-service', label: 'order-service' },
                    { value: 'inventory-service', label: 'inventory-service' },
                    { value: 'gateway-service', label: 'gateway-service' },
                    { value: 'kafka', label: 'kafka' },
                    { value: 'neo4j', label: 'neo4j' },
                  ]}
                  value={serviceFilter}
                  onChange={setServiceFilter}
                  styles={{ input: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', width: 160 } }}
                />
                <Select
                  placeholder="Severity"
                  data={[
                    { value: 'all', label: 'All Severities' },
                    { value: 'CRITICAL', label: 'Critical' },
                    { value: 'ERROR', label: 'Error' },
                    { value: 'WARNING', label: 'Warning' },
                    { value: 'INFO', label: 'Info' },
                  ]}
                  value={levelFilter}
                  onChange={setLevelFilter}
                  styles={{ input: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', width: 140 } }}
                />
                <Button onClick={handleSearch} loading={searching} color="cyan">
                  Search
                </Button>
              </Group>
            </Group>

            <Paper p="sm" radius="md" style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace' }}>
              <Text size="xs" c="cyan" mb="xs" fw={700}>📟 LIVE LOG TERMINAL STREAM</Text>
              <div style={{ overflowX: 'auto' }}>
                <Table style={{ color: '#e2e8f0' }}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ color: '#64748b' }}>Time</Table.Th>
                      <Table.Th style={{ color: '#64748b' }}>Level</Table.Th>
                      <Table.Th style={{ color: '#64748b' }}>Service</Table.Th>
                      <Table.Th style={{ color: '#64748b' }}>Vector Similarity</Table.Th>
                      <Table.Th style={{ color: '#64748b' }}>Syslog Message</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {logs.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <Text size="xs" c="dimmed">No matching logs found.</Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      logs.map(l => (
                        <Table.Tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <Table.Td><Code color="gray" style={{ background: 'transparent' }}>{l.timestamp}</Code></Table.Td>
                          <Table.Td>
                            <Badge size="xs" color={LEVEL_COLORS[l.level] || 'gray'}>{l.level}</Badge>
                          </Table.Td>
                          <Table.Td><Text size="xs" fw={600} c="white">{l.service}</Text></Table.Td>
                          <Table.Td><Text size="xs" c="teal.3">{(l.similarity * 100).toFixed(1)}% match</Text></Table.Td>
                          <Table.Td><Text size="xs" c="gray.3" style={{ fontFamily: 'Consolas, monospace' }}>{l.message}</Text></Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </div>
            </Paper>
          </Stack>
        </GlassCard>
      </Stack>
    </PageTransition>
  );
}
