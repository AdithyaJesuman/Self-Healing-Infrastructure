// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { AppShell, Text, Group, Badge, Button, Stack, Box } from '@mantine/core';
import { AnimatePresence } from 'motion/react';
import Overview from './routes/Overview';
import LiveDashboard from './routes/LiveDashboard';
import IncidentMemory from './routes/IncidentMemory';
import ChaosPanel from './routes/ChaosPanel';
import DocsViewer from './routes/DocsViewer';
import TestsRunner from './routes/TestsRunner';
import Login from './routes/Login';
import { useAuth } from './hooks/useAuth';

const NAV_ITEMS = [
  { path: '/', label: 'Live Telemetry', icon: '📊', badge: 'LIVE' },
  { path: '/overview', label: 'Topology & KPIs', icon: '⚡' },
  { path: '/incidents', label: 'Incident Memory', icon: '🧠' },
  { path: '/chaos', label: 'Chaos Lab', icon: '💥' },
  { path: '/tests', label: 'QA Runner', icon: '🧪' },
  { path: '/docs', label: 'Architecture Docs', icon: '📖' },
];


export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 250, breakpoint: 'sm' }}
      padding="lg"
      styles={{
        root: {
          background: '#0a0f1d',
          minHeight: '100vh',
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        header: {
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
        navbar: {
          background: 'rgba(11, 17, 32, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        },
        main: {
          background: 'radial-gradient(ellipse at top left, #0f172a 0%, #060913 100%)',
          minHeight: 'calc(100vh - 64px)',
        },
      }}
    >
      <AppShell.Header p="md">
        <Group justify="space-between" align="center" style={{ height: '100%' }}>
          <Group gap="sm">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#fff',
                fontSize: 16,
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.5)',
              }}
            >
              AI
            </div>
            <div>
              <Text size="md" fw={800} c="white" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                AIOps Command Center
              </Text>
              <Text size="xs" c="dimmed">
                Autonomous Self-Healing Ops
              </Text>
            </div>
          </Group>

          <Group gap="md">
            <Group gap={6}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              <Text size="xs" c="teal" fw={600}>
                AUTONOMOUS ENGINE ACTIVE
              </Text>
            </Group>

            {user ? (
              <Group gap="xs">
                <Badge variant="light" color="cyan">{user.username}</Badge>
                <Button size="xs" variant="subtle" color="gray" onClick={logout}>
                  Sign Out
                </Button>
              </Group>
            ) : (
              <NavLink to="/login" style={{ textDecoration: 'none' }}>
                <Button size="xs" variant="light" color="cyan">
                  Operator Login
                </Button>
              </NavLink>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs" style={{ height: '100%' }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" px={8} mt={8}>
            Platform Navigation
          </Text>

          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Group gap="xs">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Group>
                {item.badge && (
                  <Badge size="xs" color="teal" variant="filled">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}

          <Box mt="auto" p="sm" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Text size="xs" fw={600} c="gray.4">Platform Status</Text>
            <Text size="xs" c="dimmed" mt={2}>Kafka, Influx, Neo4j connected</Text>
            <Text size="xs" c="teal" mt={4}>● Zero downtime mode</Text>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LiveDashboard />} />
            <Route path="/dashboard" element={<LiveDashboard />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/incidents" element={<IncidentMemory />} />
            <Route path="/chaos" element={<ChaosPanel />} />
            <Route path="/docs" element={<DocsViewer />} />
            <Route path="/tests" element={<TestsRunner />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AppShell.Main>
    </AppShell>
  );
}


