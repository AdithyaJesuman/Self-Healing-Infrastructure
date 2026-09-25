// src/components/GlassCard.tsx
import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: ReactNode;
  glowColor?: string;
  enableHover?: boolean;
  style?: React.CSSProperties;
  className?: string;
  accentBar?: boolean;
}

export default function GlassCard({
  children,
  glowColor = '#06B6D4',
  enableHover = true,
  style,
  className,
  accentBar = true
}: GlassCardProps) {
  const CardWrapper = enableHover ? motion.div : 'div';
  const motionProps = enableHover
    ? {
        whileHover: { y: -3, scale: 1.006 },
        transition: { type: 'spring', stiffness: 350, damping: 25 },
      }
    : {};

  return (
    <CardWrapper
      {...motionProps}
      style={{
        height: '100%',
        padding: '1.5px',
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${glowColor}40 0%, rgba(255, 255, 255, 0.08) 40%, ${glowColor}20 100%)`,
        boxShadow: `0 14px 35px -10px ${glowColor}25, 0 1px 3px rgba(0, 0, 0, 0.5)`,
        transition: 'all 0.25s ease-out',
        ...style
      }}
      className={className}
    >
      <div
        style={{
          height: '100%',
          padding: '20px',
          borderRadius: '14.5px',
          background: 'rgba(10, 15, 29, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 10px 30px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glowing Top Edge Accent Line */}
        {accentBar && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
              opacity: 0.8,
              zIndex: 2
            }}
          />
        )}

        {/* Ambient Mesh Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            left: '-40%',
            width: '180%',
            height: '180%',
            background: `radial-gradient(circle at 25% 15%, ${glowColor}12 0%, transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          {children}
        </div>
      </div>
    </CardWrapper>
  );
}
