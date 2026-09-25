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
  trend?: string;
  status?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const statusColors: Record<string, string> = {
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
  trend,
  status = 'healthy',
  subtitle,
  icon,
}: MetricCardProps) {
  const accent = statusColors[status] || '#10B981';

  return (
    <GlassCard glowColor={accent}>
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 8px ${accent}`
              }}
            />
            {icon && <span style={{ color: accent }}>{icon}</span>}
            <Title order={6} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.68rem', fontWeight: 700 }}>
              {title}
            </Title>
          </Group>
          {change && (
            <Badge
              size="xs"
              variant="filled"
              color={status === 'critical' ? 'red' : 'teal'}
            >
              {change}
            </Badge>
          )}
        </Group>

        <Group align="baseline" gap="xs" mt={2}>
          <motion.div
            key={String(value)}
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Text
              c="white"
              style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {value}
            </Text>
          </motion.div>
          {unit && (
            <Text c="dimmed" size="xs" fw={600}>
              {unit}
            </Text>
          )}
        </Group>

        {subtitle && (
          <Text c="dimmed" size="xs" style={{ opacity: 0.8, fontSize: '0.72rem' }}>
            {subtitle}
          </Text>
        )}
      </Stack>
    </GlassCard>
  );
}
