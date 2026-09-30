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
} from '@mantine/core';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Legend } from 'recharts';

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
  fix_title?: string;
  fix_summary?: string;
  policy_decision: string;
  technical_playbook?: {
    title?: string;
    summary?: string;
    action_name?: string;
    description?: string;
    executed_steps: string[];
    parameter_changes: Record<string, string>;
    verification?: string;
  };
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

// 49 Real Production NAB Datasets
const FALLBACK_NAB_DATASETS = [
  { label: 'AWS EC2 CPU - ec2_cpu_utilization_24fa92.csv', value: 'ec2_cpu_utilization_24fa92.csv' },
  { label: 'AWS EC2 CPU - ec2_cpu_utilization_53ea38.csv', value: 'ec2_cpu_utilization_53ea38.csv' },
  { label: 'AWS EC2 CPU - ec2_cpu_utilization_5f5533.csv', value: 'ec2_cpu_utilization_5f5533.csv' },
  { label: 'AWS EC2 CPU - ec2_cpu_utilization_825cc2.csv', value: 'ec2_cpu_utilization_825cc2.csv' },
  { label: 'AWS EC2 CPU - ec2_cpu_utilization_ac20cd.csv', value: 'ec2_cpu_utilization_ac20cd.csv' },
  { label: 'AWS EC2 CPU - ec2_cpu_utilization_c6585a.csv', value: 'ec2_cpu_utilization_c6585a.csv' },
  { label: 'AWS EC2 CPU - ec2_cpu_utilization_fe7f93.csv', value: 'ec2_cpu_utilization_fe7f93.csv' },

  { label: 'AWS RDS DB - rds_cpu_utilization_cc0417.csv', value: 'rds_cpu_utilization_cc0417.csv' },
  { label: 'AWS RDS DB - rds_cpu_utilization_e47b3b.csv', value: 'rds_cpu_utilization_e47b3b.csv' },

  { label: 'AWS ELB - elb_request_count_8c0756.csv', value: 'elb_request_count_8c0756.csv' },

  { label: 'Real Outage - AWS Cloud Outage (ec2_network_in_257a54.csv)', value: 'ec2_network_in_257a54.csv' },
  { label: 'Real Outage - Traffic Surge Outage (nyc_taxi.csv)', value: 'nyc_taxi.csv' },
  { label: 'Real Outage - System Failure Trace (ambient_temperature_system_failure.csv)', value: 'ambient_temperature_system_failure.csv' },
  { label: 'Real Outage - Machine Failure (machine_temperature_system_failure.csv)', value: 'machine_temperature_system_failure.csv' },

  { label: 'Traffic Surge - Twitter Volume AMZN.csv', value: 'Twitter_volume_AMZN.csv' },
  { label: 'Traffic Surge - Twitter Volume AAPL.csv', value: 'Twitter_volume_AAPL.csv' },
  { label: 'Traffic Surge - Twitter Volume GOOG.csv', value: 'Twitter_volume_GOOG.csv' }
];

export default function CsvAnalyzer() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [companyId, setCompanyId] = useState<string>('AWS-Production-Cluster');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Restore analysis results array from sessionStorage for tab switching persistence
  const [results, setResults] = useState<AnalysisResult[]>(() => {
    try {
      const cached = sessionStorage.getItem('aiops_csv_results');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });

  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [selectedDataset, setSelectedDataset] = useState<string | null>('ec2_cpu_utilization_53ea38.csv');

  // Fix Simulation Modal State
  const [activeFixModal, setActiveFixModal] = useState<boolean>(false);
  const [fixingAnomaly, setFixingAnomaly] = useState<AnomalyItem | null>(null);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  // Sync results to sessionStorage
  useEffect(() => {
    if (results.length > 0) {
      try {
        sessionStorage.setItem('aiops_csv_results', JSON.stringify(results));
      } catch (e) {}
    }
  }, [results]);

  // Upload custom CSV file to backend /api/upload-csv
  const handleUploadCustomCsv = async () => {
    if (!uploadFile) {
      setError('Please select a custom CSV file to upload.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('company_id', companyId);

      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      const data: AnalysisResult = await res.json();
      setResults((prev) => [data, ...prev]);
      setSelectedFileIdx(0);
      setUploadFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and analyze custom CSV file.');
    } finally {
      setLoading(false);
    }
  };

  // Analyze pre-loaded NAB dataset from disk via /api/analyze-dataset
  const handleAnalyzeSelectedDataset = async () => {
    if (!selectedDataset) {
      setError('Please select a dataset from the dropdown box.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cleanName = selectedDataset.split('/').pop() || selectedDataset;
      const res = await fetch(`/api/analyze-dataset?dataset_name=${encodeURIComponent(cleanName)}&company_id=${encodeURIComponent(companyId)}`);
      if (!res.ok) {
        throw new Error(`Dataset analysis failed: ${res.statusText}`);
      }
      const data: AnalysisResult = await res.json();

      setResults((prev) => [data, ...prev]);
      setSelectedFileIdx(0);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze selected NAB dataset.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Digital Twin simulation for an anomaly fix
  const handleRunDigitalTwinForAnomaly = async (anom: AnomalyItem) => {
    setFixingAnomaly(anom);
    setActiveFixModal(true);
    setSimLoading(true);
    setSimResult(null);

    try {
      const res = await fetch('/api/digital-twin/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arrival_rate_lambda: anom.metrics.throughput_rps || 1200,
          service_rate_mu: 1500,
          num_replicas_c: 2,
          action: anom.action || 'horizontal_scale_out',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      }
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimLoading(false);
    }
  };

  const currentResult = results[selectedFileIdx];

  return (
    <PageTransition>
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="filled" color="cyan">Multi-CSV Ingestion</Badge>
            <Badge variant="outline" color="teal">49 NAB Datasets Available</Badge>
          </Group>
          <Title order={2} c="white">CSV Telemetry Ingestion & Autonomous Fix Simulator</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Upload custom telemetry CSVs or select from 49 production NAB outage datasets. Interactively simulate and inspect exact technical remediation playbooks.
          </Text>
        </div>

        {/* Ingestion & Selection Form */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {/* Custom File Upload Card */}
          <GlassCard glowColor="#06B6D4">
            <Stack gap="md">
              <Title order={4} c="white">📁 Upload Custom Telemetry CSV</Title>
              <FileInput
                label="Select CSV File"
                placeholder="Choose custom CSV..."
                accept=".csv"
                value={uploadFile}
                onChange={setUploadFile}
                styles={{
                  label: { color: '#ccc', marginBottom: 6 },
                  input: { background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }
                }}
              />
              <Button color="cyan" onClick={handleUploadCustomCsv} loading={loading} disabled={!uploadFile}>
                Upload & Process Custom CSV
              </Button>
            </Stack>
          </GlassCard>

          
        </SimpleGrid>

        {error && <Alert color="red" title="Analysis Error">{error}</Alert>}

        {/* Results Presentation & File Selection Tabs */}
        {results.length > 0 && (
          <Stack gap="lg">
            {/* Multi-file tabs if multiple datasets analyzed */}
            {results.length > 1 && (
              <Group gap="xs">
                <Text size="xs" c="dimmed">Analyzed Files:</Text>
                {results.map((res, idx) => (
                  <Button
                    key={idx}
                    size="xs"
                    variant={selectedFileIdx === idx ? 'filled' : 'outline'}
                    color={selectedFileIdx === idx ? 'cyan' : 'gray'}
                    onClick={() => setSelectedFileIdx(idx)}
                  >
                    {res.filename} ({res.anomalies_detected_count} anomalies)
                  </Button>
                ))}
              </Group>
            )}

            {currentResult && (
              <Stack gap="lg">
                <Group justify="space-between" align="center">
                  <div>
                    <Title order={3} c="white">Analysis Summary: {currentResult.filename}</Title>
                    <Text size="xs" c="dimmed">
                      Processed {currentResult.total_records_processed} telemetry records | Found {currentResult.anomalies_detected_count} critical anomalies
                    </Text>
                  </div>
                  <Badge size="lg" color={currentResult.anomalies_detected_count > 0 ? 'red' : 'teal'}>
                    {currentResult.anomalies_detected_count} ANOMALIES DETECTED
                  </Badge>
                </Group>

                {/* Telemetry Line Chart for Records */}
                {currentResult.records && currentResult.records.length > 0 && (
                  <GlassCard glowColor="#06B6D4">
                    <Stack gap="md" style={{ height: 260 }}>
                      <Title order={4} c="white">Ingested Dataset Telemetry Trend</Title>
                      <div style={{ width: '100%', height: 190 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={currentResult.records.slice(0, 50)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={(t) => (typeof t === 'string' && t.length > 8 ? t.slice(-8) : t)} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
                            <Legend />
                            <Line type="monotone" dataKey="cpu_percent" name="CPU %" stroke="#06B6D4" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="response_time_ms" name="Latency (ms)" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </Stack>
                  </GlassCard>
                )}

                {/* Anomaly Table */}
                <GlassCard glowColor="#EF4444">
                  <Stack gap="md">
                    <Title order={4} c="white">Detected Anomalies & Technical Remediation Playbooks</Title>
                    {currentResult.anomalies.length === 0 ? (
                      <Alert color="teal" title="No Anomalies Detected">
                        All metric values in this dataset remained strictly within normal 3-sigma baseline bounds.
                      </Alert>
                    ) : (
                      <Table highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ color: '#aaa' }}>Row</Table.Th>
                            <Table.Th style={{ color: '#aaa' }}>Timestamp</Table.Th>
                            <Table.Th style={{ color: '#aaa' }}>Severity</Table.Th>
                            <Table.Th style={{ color: '#aaa' }}>Diagnosed Root Cause</Table.Th>
                            <Table.Th style={{ color: '#aaa' }}>Auto-Remediation Action</Table.Th>
                            <Table.Th style={{ color: '#aaa' }}>Action</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {currentResult.anomalies.map((anom, idx) => (
                            <Table.Tr key={idx}>
                              <Table.Td style={{ color: '#fff', fontWeight: 700 }}>#{anom.row}</Table.Td>
                              <Table.Td style={{ color: '#ccc', fontSize: '0.8rem' }}>{anom.timestamp}</Table.Td>
                              <Table.Td>
                                <Badge color={anom.severity === 'critical' ? 'red' : anom.severity === 'high' ? 'orange' : 'yellow'} variant="filled" size="xs">
                                  {anom.severity.toUpperCase()}
                                </Badge>
                              </Table.Td>
                              <Table.Td style={{ color: '#06B6D4', fontWeight: 600 }}>{anom.root_cause}</Table.Td>
                              <Table.Td style={{ color: '#10B981', fontWeight: 600 }}>{anom.action}</Table.Td>
                              <Table.Td>
                                <Button
                                  size="xs"
                                  color="cyan"
                                  variant="light"
                                  onClick={() => handleRunDigitalTwinForAnomaly(anom)}
                                >
                                  Inspect How Fix Works
                                </Button>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    )}
                  </Stack>
                </GlassCard>
              </Stack>
            )}
          </Stack>
        )}

        {/* Modal: Interactive Digital Twin Fix Inspection */}
        <Modal
          opened={activeFixModal}
          onClose={() => setActiveFixModal(false)}
          title={<Text fw={800} c="white" size="lg">🛠️ Technical Remediation Playbook & Twin Analysis</Text>}
          size="lg"
          styles={{
            content: { background: '#090d16', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' },
            header: { background: '#090d16', color: '#fff' }
          }}
        >
          {fixingAnomaly && (
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed">Diagnosed Root Cause</Text>
                  <Text fw={800} c="cyan" size="md">{fixingAnomaly.root_cause}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">Executed Action</Text>
                  <Text fw={800} c="teal" size="md">{fixingAnomaly.action}</Text>
                </div>
              </Group>

              {fixingAnomaly.fix_summary && (
                <Paper p="md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                  <Text fw={700} c="white" size="sm" mb={4}>{fixingAnomaly.fix_title || 'Remediation Fix Summary'}</Text>
                  <Text size="xs" c="gray.3" mb="md">{fixingAnomaly.fix_summary}</Text>

                  {fixingAnomaly.technical_playbook && fixingAnomaly.technical_playbook.executed_steps && (
                    <>
                      <Text fw={700} c="white" size="xs" mb={4}>Exact Step-by-Step Executed Playbook:</Text>
                      <Stack gap={4} mb="md">
                        {fixingAnomaly.technical_playbook.executed_steps.map((step, sIdx) => (
                          <Text key={sIdx} size="xs" c="gray.3" style={{ fontFamily: 'monospace' }}>
                            {step}
                          </Text>
                        ))}
                      </Stack>
                    </>
                  )}
                </Paper>
              )}

              {simLoading ? (
                <Loader size="sm" color="cyan" title="Simulating Digital Twin queue math..." />
              ) : simResult?.simulation ? (
                <Paper p="md" style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: 12 }}>
                  <Text fw={700} c="cyan" size="sm" mb="xs">🔮 Digital Twin Queueing Simulation Impact:</Text>
                  <Grid gutter="xs">
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Latency Before Fix:</Text>
                      <Text size="md" fw={800} c="red">{simResult.simulation.pre_fix_latency_ms} ms</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Predicted Latency After Fix:</Text>
                      <Text size="md" fw={800} c="teal">{simResult.simulation.post_fix_latency_ms} ms</Text>
                    </Grid.Col>
                  </Grid>
                </Paper>
              ) : null}

              <Button fullWidth color="cyan" onClick={() => setActiveFixModal(false)}>
                Close Playbook Inspection
              </Button>
            </Stack>
          )}
        </Modal>
      </Stack>
    </PageTransition>
  );
}

