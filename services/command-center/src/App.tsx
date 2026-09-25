// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { AppShell, Text, Group, Badge, Button, Stack, Box, Tooltip } from '@mantine/core';
import { AnimatePresence } from 'motion/react';
import Overview from './routes/Overview';
import LiveDashboard from './routes/LiveDashboard';
import IncidentMemory from './routes/IncidentMemory';
import ChaosPanel from './routes/ChaosPanel';
import DocsViewer from './routes/DocsViewer';
import TestsRunner from './routes/TestsRunner';
import CsvAnalyzer from './routes/CsvAnalyzer';
import LiveLogIntelligence from './routes/LiveLogIntelligence';
import DigitalTwinStudio from './routes/DigitalTwinStudio';
import CausalGraphStudio from './routes/CausalGraphStudio';
import Login from './routes/Login';
import { useAuth } from './hooks/useAuth';

interface NavSection {
  title: string;
  items: Array<{
    path: string;
    label: string;
    icon: string;
    badge?: string;
    badgeColor?: string;
  }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'REAL-TIME OPERATIONS',
    items: [
      { path: '/', label: 'Live Telemetry', icon: '⚡', badge: 'LIVE', badgeColor: 'cyan' },
      { path: '/logs', label: 'Log Intelligence', icon: '📋', badge: 'STREAM', badgeColor: 'teal' },
      { path: '/overview', label: 'Topology & Mesh', icon: '🕸️', badge: '7 NODES', badgeColor: 'blue' },
    ]
  },
  {
    title: 'AI & PREDICTIVE STUDIOS',
    items: [
      { path: '/twin', label: 'Digital Twin Studio', icon: '🔮', badge: 'M/M/k', badgeColor: 'grape' },
      { path: '/graph', label: 'Causal Graph & RCA', icon: '🎯', badge: 'DAG', badgeColor: 'indigo' },
      { path: '/csv-analyzer', label: 'CSV Ingestion & NAB', icon: '📁', badge: '49 NAB', badgeColor: 'violet' },
    ]
  },
  {
    title: 'REMEDIATION & GOVERNANCE',
    items: [
      { path: '/incidents', label: 'Incident Memory', icon: '🧠', badge: 'CHROMADB', badgeColor: 'orange' },
      { path: '/chaos', label: 'Chaos Lab', icon: '💥', badge: 'CHAOS', badgeColor: 'red' },
      { path: '/tests', label: 'QA Runner', icon: '🧪', badge: 'SUITE', badgeColor: 'lime' },
      { path: '/docs', label: 'Architecture Docs', icon: '📖' },
    ]
  }
];

export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [systemStatus, setSystemStatus] = useState({
    cpu: 18,
    ram: 34,
    latency: 0.73,
    activeServices: 7
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/system/status');
        if (res.ok) {
          const data = await res.json();
          if (data.cpu_percent !== undefined) {
            setSystemStatus({
              cpu: Math.round(data.cpu_percent),
              ram: Math.round(data.memory_percent || 34),
              latency: 0.73,
              activeServices: 7
            });
          }
        }
      } catch (err) {
        // Fallback smooth poll
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="bg-cyber-grid" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Background Ambient Orbs */}
      <div className="orb-glow-cyan" />
      <div className="orb-glow-violet" />

      <AppShell
        header={{ height: 64 }}
        navbar={{ width: 260, breakpoint: 'sm' }}
        padding="lg"
        styles={{
          root: {
            background: 'transparent',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          header: {
            background: 'rgba(8, 12, 24, 0.88)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          },
          navbar: {
            background: 'rgba(7, 10, 20, 0.94)',
            backdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          },
          main: {
            background: 'transparent',
            minHeight: 'calc(100vh - 64px)',
          },
        }}
      >
        {/* Top Header Bar */}
        <AppShell.Header p="md">
          <Group justify="space-between" align="center" style={{ height: '100%' }}>
            {/* Branding Logo */}
            <Group gap="sm">
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: '#fff',
                  fontSize: 18,
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                  letterSpacing: '-0.05em'
                }}
              >
                AI
              </div>
              <div>
                <Group gap={6} align="center">
                  <Text size="md" fw={900} c="white" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    AIOps Command Center
                  </Text>
                  <Badge size="xs" variant="gradient" gradient={{ from: 'cyan', to: 'violet', deg: 90 }}>
                    v2.4 PRO
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" style={{ fontSize: '0.72rem' }}>
                  Autonomous Infrastructure Self-Healing Engine
                </Text>
              </div>
            </Group>

            {/* Middle Real-time Hardware Ticker */}
            <Group gap="lg" visibleFrom="md" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <Group gap={6}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} className="animate-pulse-glow" />
                <Text size="xs" c="emerald" fw={700} style={{ letterSpacing: '0.05em' }}>
                  AUTONOMOUS HEALER ACTIVE
                </Text>
              </Group>
              <Text size="xs" c="dimmed">|</Text>
              <Tooltip label="Real host CPU percent via psutil">
                <Text size="xs" c="gray.3" fw={600} style={{ fontFamily: 'monospace' }}>
                  CPU: <span style={{ color: systemStatus.cpu > 70 ? '#EF4444' : '#06B6D4' }}>{systemStatus.cpu}%</span>
                </Text>
              </Tooltip>
              <Text size="xs" c="dimmed">|</Text>
              <Tooltip label="Host Memory Utilization">
                <Text size="xs" c="gray.3" fw={600} style={{ fontFamily: 'monospace' }}>
                  RAM: <span style={{ color: '#8B5CF6' }}>{systemStatus.ram}%</span>
                </Text>
              </Tooltip>
              <Text size="xs" c="dimmed">|</Text>
              <Tooltip label="Vector Diagnostic Decision Latency">
                <Text size="xs" c="gray.3" fw={600} style={{ fontFamily: 'monospace' }}>
                  LATENCY: <span style={{ color: '#10B981' }}>{systemStatus.latency}ms</span>
                </Text>
              </Tooltip>
            </Group>

            {/* Auth / Quick Action Controls */}
            <Group gap="sm">
              <NavLink to="/chaos">
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  radius="md"
                  leftSection="💥"
                  style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                  Inject Chaos
                </Button>
              </NavLink>
              {user ? (
                <Group gap="xs">
                  <Badge size="sm" variant="dot" color="teal">
                    {user.username}
                  </Badge>
                  <Button size="xs" variant="subtle" color="gray" onClick={logout}>
                    Logout
                  </Button>
                </Group>
              ) : (
                <NavLink to="/login">
                  <Button size="xs" variant="filled" color="cyan" radius="md">
                    Sign In
                  </Button>
                </NavLink>
              )}
            </Group>
          </Group>
        </AppShell.Header>

        {/* Sidebar Navigation */}
        <AppShell.Navbar p="sm">
          <Stack justify="space-between" style={{ height: '100%' }}>
            <Stack gap="md">
              {NAV_SECTIONS.map((section, idx) => (
                <Box key={idx}>
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    mb={6}
                    px={8}
                    style={{
                      letterSpacing: '0.1em',
                      fontSize: '0.64rem',
                      textTransform: 'uppercase',
                      color: '#64748b'
                    }}
                  >
                    {section.title}
                  </Text>
                  <Stack gap={4}>
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
                            px="sm"
                            py={8}
                            style={{
                              borderRadius: '10px',
                              background: isActive
                                ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.18) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                : 'transparent',
                              borderLeft: isActive ? '3px solid #06b6d4' : '3px solid transparent',
                              color: isActive ? '#ffffff' : '#94a3b8',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              backdropFilter: isActive ? 'blur(10px)' : 'none',
                            }}
                            className="hover:bg-white/5"
                          >
                            <Group justify="space-between" align="center">
                              <Group gap="xs">
                                <Text size="sm">{item.icon}</Text>
                                <Text
                                  size="xs"
                                  fw={isActive ? 700 : 500}
                                  style={{ letterSpacing: '-0.01em' }}
                                >
                                  {item.label}
                                </Text>
                              </Group>
                              {item.badge && (
                                <Badge
                                  size="xs"
                                  variant={isActive ? 'filled' : 'outline'}
                                  color={item.badgeColor || 'cyan'}
                                  style={{ fontSize: '0.6rem', height: 16, padding: '0 5px' }}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Group>
                          </Box>
                        </NavLink>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>

            {/* Footer System Info Card */}
            <Box
              p="xs"
              style={{
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <Group justify="space-between" align="center">
                <div>
                  <Text size="xs" fw={700} c="white">
                    Capstone AI Ops
                  </Text>
                  <Text size="xs" c="dimmed" style={{ fontSize: '0.68rem' }}>
                    10-Layer Self-Healing Pipeline
                  </Text>
                </div>
                <Badge size="xs" color="teal" variant="light">
                  READY
                </Badge>
              </Group>
            </Box>
          </Stack>
        </AppShell.Navbar>

        {/* Main Content Router */}
        <AppShell.Main>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LiveDashboard />} />
              <Route path="/logs" element={<LiveLogIntelligence />} />
              <Route path="/twin" element={<DigitalTwinStudio />} />
              <Route path="/graph" element={<CausalGraphStudio />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/incidents" element={<IncidentMemory />} />
              <Route path="/chaos" element={<ChaosPanel />} />
              <Route path="/docs" element={<DocsViewer />} />
              <Route path="/tests" element={<TestsRunner />} />
              <Route path="/csv-analyzer" element={<CsvAnalyzer />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </AppShell.Main>
      </AppShell>
    </Box>
  );
}
