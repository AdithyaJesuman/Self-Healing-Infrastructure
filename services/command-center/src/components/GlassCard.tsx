// src/components/GlassCard.tsx
import React, { ReactNode } from 'react';
import { Card, CardProps } from '@mantine/core';
import { motion } from 'motion/react';

interface GlassCardProps extends CardProps {
  children: ReactNode;
  glowColor?: string;
  enableHover?: boolean;
}

export default function GlassCard({
  children,
  glowColor,
  enableHover = true,
  style,
  ...props
}: GlassCardProps) {
  const CardWrapper = enableHover ? motion.div : 'div';
  const motionProps = enableHover
    ? {
        whileHover: { y: -3, scale: 1.01 },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <CardWrapper {...motionProps} style={{ height: '100%' }}>
      <Card
        shadow="md"
        p="lg"
        radius="md"
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${glowColor ? `${glowColor}40` : 'rgba(255, 255, 255, 0.08)'}`,
          boxShadow: glowColor
            ? `0 8px 32px 0 ${glowColor}15, inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`
            : '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          height: '100%',
          ...style,
        }}
        {...props}
      >
        {children}
      </Card>
    </CardWrapper>
  );
}

