// src/components/MetricCard.tsx
import React from 'react';
import { Text, Title, Group, Badge, Stack } from '@mantine/core';
import { motion } from 'motion/react';
import GlassCard from './GlassCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'healthy' | 'warning' | 'critical' | 'info';
  subtitle?: string;
  icon?: React.ReactNode;
}

const statusColors = {
  healthy: '#10B981', // emerald
  warning: '#F59E0B', // amber
  critical: '#EF4444', // red
  info: '#3B82F6',    // blue
};

export default function MetricCard({
  title,
  value,
  unit,
  change,
  trend = 'neutral',
  status = 'healthy',
  subtitle,
  icon,
}: MetricCardProps) {
  const accent = statusColors[status];

  return (
    <GlassCard glowColor={accent}>
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            {icon && <span style={{ color: accent }}>{icon}</span>}
            <Title order={6} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>
              {title}
            </Title>
          </Group>
          {change && (
            <Badge
              size="sm"
              variant="light"
              color={trend === 'up' ? (status === 'critical' ? 'red' : 'green') : trend === 'down' ? 'blue' : 'gray'}
            >
              {change}
            </Badge>
          )}
        </Group>

        <Group align="baseline" gap="xs">
          <motion.div
            key={String(value)}
            initial={{ scale: 1.08, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <Text
              c="white"
              style={{
                fontSize: '1.85rem',
                fontWeight: 700,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: 1.1,
              }}
            >
              {value}
            </Text>
          </motion.div>
          {unit && (
            <Text c="dimmed" size="sm" fw={600}>
              {unit}
            </Text>
          )}
        </Group>

        {subtitle && (
          <Text c="dimmed" size="xs" style={{ opacity: 0.85 }}>
            {subtitle}
          </Text>
        )}
      </Stack>
    </GlassCard>
  );
}

