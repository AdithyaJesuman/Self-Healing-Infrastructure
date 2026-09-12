import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Center, Stack, Badge, Group, Alert } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageTransition from '../components/PageTransition';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username required');
      return;
    }
    login(username);
    navigate('/');
  };

  return (
    <PageTransition>
      <Center style={{ minHeight: '80vh' }}>
        <Paper
          p="xl"
          radius="lg"
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}
        >
          <form onSubmit={handleLogin}>
            <Stack gap="md">
              <div>
                <Group gap="xs" mb="xs">
                  <Badge variant="filled" color="cyan">AIOps Gateway</Badge>
                  <Badge variant="outline" color="gray">Secure Access</Badge>
                </Group>
                <Title order={2} c="white">Sign In to Console</Title>
                <Text size="xs" c="dimmed" mt={4}>
                  Enter credentials to access the autonomous operations command center.
                </Text>
              </div>

              {error && <Alert color="red" title="Authentication Error">{error}</Alert>}

              <TextInput
                label="Username / Operator ID"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.currentTarget.value)}
                required
                styles={{
                  label: { color: '#cbd5e1', fontSize: '13px', marginBottom: 4 },
                  input: { background: 'rgba(0, 0, 0, 0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' },
                }}
              />

              <PasswordInput
                label="Access Token / Secret"
                placeholder="Enter token"
                value={password}
                onChange={e => setPassword(e.currentTarget.value)}
                required
                styles={{
                  label: { color: '#cbd5e1', fontSize: '13px', marginBottom: 4 },
                  input: { background: 'rgba(0, 0, 0, 0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' },
                }}
              />

              <Button
                type="submit"
                color="cyan"
                fullWidth
                size="md"
                mt="xs"
                styles={{ root: { boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.39)' } }}
              >
                Enter Command Center
              </Button>

              <Paper p="xs" radius="sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Text size="xs" c="dimmed" ta="center">
                  Demo credentials: <strong style={{ color: '#38bdf8' }}>admin</strong> (pre-filled)
                </Text>
              </Paper>
            </Stack>
          </form>
        </Paper>
      </Center>
    </PageTransition>
  );
}