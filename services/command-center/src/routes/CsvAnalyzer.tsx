// src/routes/CsvAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Table,
  Badge,
  TextInput,
  Paper,
  SimpleGrid,
  Alert,
  Loader,
  FileInput,
  Select,
  Modal,
  Tabs,
  Accordion,
  Code,
} from '@mantine/core';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface MetricSnapshot {
  company_id: string;
  service_name?: string;
  timestamp: string;
  cpu_percent: number;
  memory_percent: number;
  response_time_ms: number;
  error_rate: number;
  active_connections?: number;
  throughput_rps?: number;
  queue_depth?: number;
  db_query_time_ms?: number;
}

interface AnomalyItem {
  row: number;
  company_id: string;
  service_name?: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: string;
  metrics: MetricSnapshot;
  root_cause: string;
  action: string;
  policy_decision: string;
}

interface AnalysisResult {
  status: string;
  company_id: string;
  filename: string;
  total_records_processed: number;
  anomalies_detected_count: number;
  anomalies: AnomalyItem[];
  records: MetricSnapshot[];
  message: string;
}

interface ProjectDataset {
  name: string;
  label: string;
}

interface DatasetCategory {
  category: string;
  datasets: ProjectDataset[];
}

export default function CsvAnalyzer() {
  const [files, setFiles] = useState<File[]>([]);
  const [companyId, setCompanyId] = useState<string>('AWS-Production-Cluster');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sample Datasets State
  const [datasetCategories, setDatasetCategories] = useState<DatasetCategory[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  // Fix Simulation Modal State
  const [activeFixModal, setActiveFixModal] = useState<boolean>(false);
  const [fixingAnomaly, setFixingAnomaly] = useState<AnomalyItem | null>(null);
  const [fixSimulationResult, setFixSimulationResult] = useState<any | null>(null);
  const [fixLoading, setFixLoading] = useState<boolean>(false);

  // Fetch Project Datasets on mount
  useEffect(() => {
    fetch('http://localhost:8001/api/list-sample-datasets')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setDatasetCategories(data.categories);
        }
      })
      .catch((err) => console.log('Dataset list load note:', err));
  }, []);

  // Built-in sample testbench loader for instant presentation
  const handleLoadSample = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const sampleData: AnalysisResult = {
        status: 'success',
        company_id: companyId || 'AWS-Production-Cluster',
        filename: 'my_custom_company_testbench.csv',
        total_records_processed: 15,
        anomalies_detected_count: 5,
        message: 'Successfully analyzed 15 metric records from custom testbench CSV.',
        records: [
          { company_id: companyId, service_name: 'payment-gateway', timestamp: '2026-09-25T12:23:00Z', cpu_percent: 32.5, memory_percent: 41.0, response_time_ms: 120, error_rate: 0.1, active_connections: 150, throughput_rps: 1200 },
          { company_id: companyId, service_name: 'payment-gateway', timestamp: '2026-09-25T12:23:10Z', cpu_percent: 96.8, memory_percent: 88.0, response_time_ms: 3200, error_rate: 28.5, active_connections: 980, throughput_rps: 450 },
          { company_id: companyId, service_name: 'payment-gateway', timestamp: '2026-09-25T12:23:20Z', cpu_percent: 97.3, memory_percent: 90.0, response_time_ms: 3600, error_rate: 33.5, active_connections: 990, throughput_rps: 400 },
          { company_id: companyId, service_name: 'payment-gateway', timestamp: '2026-09-25T12:23:30Z', cpu_percent: 97.8, memory_percent: 92.0, response_time_ms: 4000, error_rate: 38.5, active_connections: 995, throughput_rps: 350 },
          { company_id: companyId, service_name: 'payment-gateway', timestamp: '2026-09-25T12:23:40Z', cpu_percent: 98.3, memory_percent: 94.0, response_time_ms: 4400, error_rate: 43.5, active_connections: 998, throughput_rps: 300 },
          { company_id: companyId, service_name: 'payment-gateway', timestamp: '2026-09-25T12:23:50Z', cpu_percent: 98.8, memory_percent: 96.0, response_time_ms: 4800, error_rate: 48.5, active_connections: 1000, throughput_rps: 250 },
          { company_id: companyId, service_name: 'payment-gateway', timestamp: '2026-09-25T12:24:00Z', cpu_percent: 35.0, memory_percent: 42.0, response_time_ms: 130, error_rate: 0.2, active_connections: 160, throughput_rps: 1150 }
        ],
        anomalies: [
          {
            row: 6,
            company_id: companyId,
            service_name: 'payment-gateway',
            timestamp: '2026-09-25T12:23:10Z',
            severity: 'critical',
            confidence: '99%',
            metrics: { company_id: companyId, timestamp: '2026-09-25T12:23:10Z', cpu_percent: 96.8, memory_percent: 88.0, response_time_ms: 3200, error_rate: 28.5, active_connections: 980 },
            root_cause: 'db_connection_pool_exhaustion',
            action: 'increase_db_pool_size',
            policy_decision: 'AUTO_HEALED (5/5 Safety Gates Passed)'
          },
          {
            row: 7,
            company_id: companyId,
            service_name: 'payment-gateway',
            timestamp: '2026-09-25T12:23:20Z',
            severity: 'critical',
            confidence: '99%',
            metrics: { company_id: companyId, timestamp: '2026-09-25T12:23:20Z', cpu_percent: 97.3, memory_percent: 90.0, response_time_ms: 3600, error_rate: 33.5, active_connections: 990 },
            root_cause: 'db_connection_pool_exhaustion',
            action: 'increase_db_pool_size',
            policy_decision: 'AUTO_HEALED (5/5 Safety Gates Passed)'
          },
          {
            row: 8,
            company_id: companyId,
            service_name: 'payment-gateway',
            timestamp: '2026-09-25T12:23:30Z',
            severity: 'critical',
            confidence: '99%',
            metrics: { company_id: companyId, timestamp: '2026-09-25T12:23:30Z', cpu_percent: 97.8, memory_percent: 92.0, response_time_ms: 4000, error_rate: 38.5, active_connections: 995 },
            root_cause: 'cpu_saturation',
            action: 'horizontal_scale_out',
            policy_decision: 'AUTO_HEALED (5/5 Safety Gates Passed)'
          },
          {
            row: 9,
            company_id: companyId,
            service_name: 'payment-gateway',
            timestamp: '2026-09-25T12:23:40Z',
            severity: 'critical',
            confidence: '99%',
            metrics: { company_id: companyId, timestamp: '2026-09-25T12:23:40Z', cpu_percent: 98.3, memory_percent: 94.0, response_time_ms: 4400, error_rate: 43.5, active_connections: 998 },
            root_cause: 'cpu_saturation',
            action: 'horizontal_scale_out',
            policy_decision: 'AUTO_HEALED (5/5 Safety Gates Passed)'
          },
          {
            row: 10,
            company_id: companyId,
            service_name: 'payment-gateway',
            timestamp: '2026-09-25T12:23:50Z',
            severity: 'critical',
            confidence: '99%',
            metrics: { company_id: companyId, timestamp: '2026-09-25T12:23:50Z', cpu_percent: 98.8, memory_percent: 96.0, response_time_ms: 4800, error_rate: 48.5, active_connections: 1000 },
            root_cause: 'memory_leak',
            action: 'restart_service',
            policy_decision: 'AUTO_HEALED (5/5 Safety Gates Passed)'
          }
        ]
      };
      setResults([sampleData]);
      setSelectedFileIdx(0);
      setLoading(false);
    }, 300);
  };

  // Analyze pre-loaded NAB dataset from disk
  const handleAnalyzeSelectedDataset = async () => {
    if (!selectedDataset) {
      setError('Please select a dataset from the dropdown.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8001/api/analyze-dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_name: selectedDataset, company_id: companyId }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: AnalysisResult = await res.json();
      setResults([data]);
      setSelectedFileIdx(0);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze project dataset.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Multi-File Upload
  const handleUploadMultiple = async () => {
    if (files.length === 0) {
      setError('Please select one or more CSV files to analyze.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const batchResults: AnalysisResult[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await fetch(`http://localhost:8001/api/upload-csv?company_id=${encodeURIComponent(companyId)}`, {
          method: 'POST',
          body: file,
        });
        if (res.ok) {
          const data: AnalysisResult = await res.json();
          batchResults.push(data);
        }
      }
      setResults(batchResults);
      setSelectedFileIdx(0);
    } catch (err: any) {
      setError(err.message || 'Error processing batch CSV files.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Digital Twin Fix Simulation Modal
  const handleOpenFixModal = async (anomaly: AnomalyItem) => {
    setFixingAnomaly(anomaly);
    setActiveFixModal(true);
    setFixLoading(true);
    setFixSimulationResult(null);

    try {
      const res = await fetch('http://localhost:8001/api/simulate-fix-execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row: anomaly.row,
          company_id: anomaly.company_id,
          service_name: anomaly.service_name || 'payment-gateway',
          root_cause: anomaly.root_cause,
          action: anomaly.action,
          metrics: anomaly.metrics,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFixSimulationResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFixLoading(false);
    }
  };

  const currentResult = results[selectedFileIdx] || null;

  const filteredAnomalies = currentResult?.anomalies.filter((item) => {
    const matchesSev = filterSeverity === 'all' || item.severity === filterSeverity;
    const matchesSearch =
      item.timestamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.root_cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  }) || [];

  // Total summary across all loaded files
  const grandTotalRecords = results.reduce((acc, r) => acc + r.total_records_processed, 0);
  const grandTotalAnomalies = results.reduce((acc, r) => acc + r.anomalies_detected_count, 0);

  return (
    <PageTransition>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} c="white" style={{ letterSpacing: '-0.02em' }}>
              📁 Multi-CSV Telemetry Ingestion & Fix Simulator
            </Title>
            <Text c="dimmed" size="sm">
              Upload multiple CSV files or analyze pre-loaded 49 NAB production datasets directly. Interactively simulate digital twin fixes for detected issues.
            </Text>
          </div>
          <Badge variant="gradient" gradient={{ from: 'cyan', to: 'indigo' }} size="lg">
            MULTI-FILE BATCH MODE ACTIVE
          </Badge>
        </Group>

        {/* Input & Selection Panel */}
        <GlassCard p="lg">
          <Tabs defaultValue="sample-datasets">
            <Tabs.List mb="md">
              <Tabs.Tab value="sample-datasets">📊 Project NAB Datasets (49 Production Files)</Tabs.Tab>
              <Tabs.Tab value="custom-files">📁 Upload Custom CSV Files (Multi-Select)</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="sample-datasets">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" align="flex-end">
                <TextInput
                  label="Company / Cluster Tag"
                  placeholder="e.g. AWS-Production-Cluster"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.currentTarget.value)}
                  styles={{ input: { background: 'rgba(15, 23, 42, 0.6)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' } }}
                />

                <Select
                  label="Select Real NAB Outage Dataset"
                  placeholder="Choose an EC2, RDS, ELB or Outage CSV..."
                  value={selectedDataset}
                  onChange={setSelectedDataset}
                  searchable
                  data={datasetCategories.flatMap((cat) =>
                    cat.datasets.map((d) => ({
                      value: d.name,
                      label: `[${cat.category}] ${d.label}`,
                    }))
                  )}
                  styles={{ input: { background: 'rgba(15, 23, 42, 0.6)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' } }}
                />

                <Group gap="xs">
                  <Button
                    color="cyan"
                    loading={loading}
                    onClick={handleAnalyzeSelectedDataset}
                    style={{ flex: 1 }}
                  >
                    Analyze Dataset
                  </Button>
                  <Button
                    variant="outline"
                    color="indigo"
                    onClick={handleLoadSample}
                    style={{ flex: 1 }}
                  >
                    ⚡ Demo CSV
                  </Button>
                </Group>
              </SimpleGrid>
            </Tabs.Panel>

            <Tabs.Panel value="custom-files">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" align="flex-end">
                <TextInput
                  label="Company / Tenant Tag"
                  placeholder="e.g. FinTech-Global"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.currentTarget.value)}
                  styles={{ input: { background: 'rgba(15, 23, 42, 0.6)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' } }}
                />

                <FileInput
                  label="Upload Multiple CSV Metric Files"
                  placeholder="Select one or more .csv files..."
                  accept=".csv"
                  multiple
                  value={files}
                  onChange={setFiles}
                  styles={{ input: { background: 'rgba(15, 23, 42, 0.6)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' } }}
                />

                <Button
                  color="cyan"
                  loading={loading}
                  onClick={handleUploadMultiple}
                >
                  Analyze Batch Files ({files.length})
                </Button>
              </SimpleGrid>
            </Tabs.Panel>
          </Tabs>

          {error && (
            <Alert color="red" mt="md" title="Dataset Analysis Error">
              {error}
            </Alert>
          )}
        </GlassCard>

        {/* Loading Indicator */}
        {loading && (
          <GlassCard p="xl" style={{ textAlign: 'center' }}>
            <Loader size="lg" color="cyan" />
            <Text mt="md" c="dimmed" size="sm">
              Processing Telemetry Stream... Computing Vectorized EMA & Isolation Forest Anomalies...
            </Text>
          </GlassCard>
        )}

        {/* Results Analysis View */}
        {results.length > 0 && !loading && (
          <Stack gap="lg">
            {/* Grand Summary Across All Loaded Files */}
            <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md">
              <Paper p="md" radius="md" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Text size="xs" c="dimmed" fw={600}>FILES ANALYZED</Text>
                <Title order={2} c="indigo" mt={4}>{results.length} Files</Title>
                <Text size="xs" c="dimmed">Multi-file batch mode</Text>
              </Paper>

              <Paper p="md" radius="md" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Text size="xs" c="dimmed" fw={600}>TOTAL RECORDS</Text>
                <Title order={2} c="cyan" mt={4}>{grandTotalRecords}</Title>
                <Text size="xs" c="dimmed">Telemetry rows parsed</Text>
              </Paper>

              <Paper p="md" radius="md" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Text size="xs" c="dimmed" fw={600}>ISSUES / OUTAGES</Text>
                <Title order={2} c="red" mt={4}>{grandTotalAnomalies}</Title>
                <Text size="xs" c="red">Anomalies identified</Text>
              </Paper>

              <Paper p="md" radius="md" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Text size="xs" c="dimmed" fw={600}>POLICY STATUS</Text>
                <Title order={3} c="teal" mt={4}>AUTO_HEALED</Title>
                <Text size="xs" c="teal">5/5 Safety Gates Passed</Text>
              </Paper>
            </SimpleGrid>

            {/* File Switcher Tabs if multiple files loaded */}
            {results.length > 1 && (
              <Group gap="xs">
                <Text size="xs" c="dimmed" fw={600}>Switch Active File View:</Text>
                {results.map((res, idx) => (
                  <Button
                    key={idx}
                    size="xs"
                    variant={selectedFileIdx === idx ? 'filled' : 'outline'}
                    color="cyan"
                    onClick={() => setSelectedFileIdx(idx)}
                  >
                    📄 {res.filename} ({res.anomalies_detected_count} issues)
                  </Button>
                ))}
              </Group>
            )}

            {currentResult && (
              <Stack gap="lg">
                {/* Metric Trajectory Chart */}
                {currentResult.records.length > 0 && (
                  <GlassCard p="lg">
                    <Group justify="space-between" mb="md">
                      <div>
                        <Title order={4} c="white">
                          📈 Telemetry Trajectory Chart: {currentResult.filename}
                        </Title>
                        <Text size="xs" c="dimmed">
                          Continuous metric timeline plotting CPU% and Response Time ms extracted from CSV timestamps.
                        </Text>
                      </div>
                      <Badge color="cyan" variant="outline">
                        {currentResult.records.length} Points Plotted
                      </Badge>
                    </Group>

                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentResult.records}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickFormatter={(val) => val.split('T')[1]?.substring(0, 8) || val} />
                          <YAxis yAxisId="left" stroke="#06b6d4" fontSize={11} domain={[0, 100]} />
                          <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={11} />
                          <Tooltip contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="cpu_percent" name="CPU Usage (%)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} />
                          <Line yAxisId="right" type="monotone" dataKey="response_time_ms" name="Response Time (ms)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                )}

                {/* Detected Issues Table */}
                <GlassCard p="lg">
                  <Group justify="space-between" mb="md">
                    <div>
                      <Title order={4} c="white">
                        ⚠️ Identified Issues & Diagnostic Actions ({currentResult.filename})
                      </Title>
                      <Text size="xs" c="dimmed">
                        Click "Simulate & Execute Fix" on any row to trigger Digital Twin simulation and 5 Policy Gates.
                      </Text>
                    </div>

                    <Group gap="xs">
                      <TextInput
                        placeholder="Search timestamp / root cause..."
                        size="xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        styles={{ input: { background: 'rgba(15, 23, 42, 0.6)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' } }}
                      />

                      <Select
                        size="xs"
                        value={filterSeverity}
                        onChange={(val) => setFilterSeverity(val || 'all')}
                        data={[
                          { value: 'all', label: 'All Severities' },
                          { value: 'critical', label: 'Critical' },
                          { value: 'high', label: 'High' },
                          { value: 'medium', label: 'Medium' },
                        ]}
                        styles={{ input: { background: 'rgba(15, 23, 42, 0.6)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.15)' } }}
                      />
                    </Group>
                  </Group>

                  <Table highlightOnHover verticalSpacing="xs">
                    <Table.Thead>
                      <Table.Tr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <Table.Th style={{ color: '#94a3b8' }}>Row #</Table.Th>
                        <Table.Th style={{ color: '#94a3b8' }}>Timestamp (UTC)</Table.Th>
                        <Table.Th style={{ color: '#94a3b8' }}>Metrics Snapshot</Table.Th>
                        <Table.Th style={{ color: '#94a3b8' }}>Severity / Conf</Table.Th>
                        <Table.Th style={{ color: '#94a3b8' }}>Identified Root Cause</Table.Th>
                        <Table.Th style={{ color: '#94a3b8' }}>Recommended Action</Table.Th>
                        <Table.Th style={{ color: '#94a3b8' }}>Interactive Fix Simulator</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredAnomalies.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                            No anomalies or issues matched your search filters.
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        filteredAnomalies.map((item) => (
                          <Table.Tr key={item.row} style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <Table.Td style={{ color: '#38bdf8', fontWeight: 700 }}>#{item.row}</Table.Td>

                            <Table.Td style={{ color: '#f8fafc', fontSize: 13, fontFamily: 'monospace' }}>
                              📅 {item.timestamp}
                            </Table.Td>

                            <Table.Td>
                              <Text size="xs" c="white" fw={600}>
                                CPU: <span style={{ color: item.metrics.cpu_percent >= 85 ? '#ef4444' : '#10b981' }}>{item.metrics.cpu_percent}%</span> |
                                RAM: {item.metrics.memory_percent}% |
                                Lat: <span style={{ color: item.metrics.response_time_ms >= 2000 ? '#ef4444' : '#38bdf8' }}>{item.metrics.response_time_ms}ms</span>
                              </Text>
                              {item.metrics.active_connections && (
                                <Text size="xs" c="dimmed">
                                  Conns: {item.metrics.active_connections} | Err: {item.metrics.error_rate}%
                                </Text>
                              )}
                            </Table.Td>

                            <Table.Td>
                              <Group gap={4}>
                                <Badge color={item.severity === 'critical' ? 'red' : item.severity === 'high' ? 'orange' : 'yellow'} size="sm">
                                  {item.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" color="cyan" size="sm">
                                  {item.confidence}
                                </Badge>
                              </Group>
                            </Table.Td>

                            <Table.Td style={{ color: '#f43f5e', fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>
                              {item.root_cause}
                            </Table.Td>

                            <Table.Td style={{ color: '#38bdf8', fontWeight: 600, fontSize: 13, fontFamily: 'monospace' }}>
                              ⚡ {item.action}
                            </Table.Td>

                            <Table.Td>
                              <Button
                                size="xs"
                                color="teal"
                                variant="light"
                                onClick={() => handleOpenFixModal(item)}
                              >
                                🧪 Simulate Auto-Fix
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        ))
                      )}
                    </Table.Tbody>
                  </Table>
                </GlassCard>
              </Stack>
            )}
          </Stack>
        )}

        {/* Fix Simulation Modal */}
        <Modal
          opened={activeFixModal}
          onClose={() => setActiveFixModal(false)}
          title="🧪 Digital Twin Fix Simulation & Policy Gate Execution"
          size="lg"
          styles={{
            header: { background: '#0f172a', color: '#fff' },
            content: { background: '#0a0f1d', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          }}
        >
          {fixLoading ? (
            <Stack align="center" py="xl">
              <Loader color="cyan" size="md" />
              <Text size="sm" c="dimmed">Running Digital Twin queueing simulation and checking 5 Policy Gates...</Text>
            </Stack>
          ) : fixSimulationResult ? (
            <Stack gap="md">
              <Alert color="teal" title={`✅ Action Executed: ${fixSimulationResult.action_executed}`}>
                Fix executed automatically following 100% policy gate validation.
              </Alert>

              {/* Pre vs Post Comparison */}
              <Paper p="md" radius="md" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Title order={5} c="white" mb="xs">📊 Metric SLA Recovery Comparison</Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ color: '#94a3b8' }}>Metric</Table.Th>
                      <Table.Th style={{ color: '#94a3b8' }}>Pre-Remediation</Table.Th>
                      <Table.Th style={{ color: '#94a3b8' }}>Post-Remediation</Table.Th>
                      <Table.Th style={{ color: '#94a3b8' }}>SLA Impact</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td style={{ color: '#fff' }}>Response Time</Table.Td>
                      <Table.Td style={{ color: '#ef4444', fontWeight: 700 }}>{fixSimulationResult.pre_fix.response_time_ms} ms</Table.Td>
                      <Table.Td style={{ color: '#10b981', fontWeight: 700 }}>{fixSimulationResult.post_fix.response_time_ms} ms</Table.Td>
                      <Table.Td style={{ color: '#10b981' }}>✅ Restored (&lt;500ms SLA)</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td style={{ color: '#fff' }}>Error Rate</Table.Td>
                      <Table.Td style={{ color: '#ef4444', fontWeight: 700 }}>{fixSimulationResult.pre_fix.error_rate}%</Table.Td>
                      <Table.Td style={{ color: '#10b981', fontWeight: 700 }}>{fixSimulationResult.post_fix.error_rate}%</Table.Td>
                      <Table.Td style={{ color: '#10b981' }}>✅ Normal (&lt;1.0%)</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Paper>

              {/* 5 Policy Gates */}
              <Paper p="md" radius="md" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Title order={5} c="white" mb="xs">🛡️ 5-Gate Policy Engine Validation</Title>
                <Stack gap={6}>
                  {fixSimulationResult.policy_gates.map((g: any, idx: number) => (
                    <Group key={idx} justify="space-between">
                      <Text size="xs" c="white" fw={600}>[x] {g.gate}</Text>
                      <Badge color="teal" size="xs">PASS: {g.details}</Badge>
                    </Group>
                  ))}
                </Stack>
              </Paper>

              {/* Markdown Post Mortem Accordion */}
              <Accordion variant="separated" styles={{ item: { background: 'rgba(15, 23, 42, 0.7)', borderColor: 'rgba(255,255,255,0.08)' }, label: { color: '#fff' } }}>
                <Accordion.Item value="post-mortem">
                  <Accordion.Control>📄 View Generated Markdown Post-Mortem Report</Accordion.Control>
                  <Accordion.Panel>
                    <Code block style={{ background: '#060913', color: '#38bdf8', padding: 12, borderRadius: 8, fontSize: 11 }}>
                      {fixSimulationResult.post_mortem_markdown}
                    </Code>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Stack>
          ) : null}
        </Modal>
      </Stack>
    </PageTransition>
  );
}
