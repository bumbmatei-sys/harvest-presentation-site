import React from 'react';
import { AnimatedText } from './magic';

/* Shared primitives + layout tokens used across the landing sections.
   Ported from the Claude Design handoff (ui_kits/website/sections1.jsx). */

// Marketing app URL is centralised in lib/ref.ts (appSignupUrl) so the affiliate
// ref + plan id always ride along. Asset paths point at /public/logos/*.
export const MARK = '/logos/harvest-mark.png';
export const FIELD = '/logos/harvest-field.jpg';
export const AV = (n: number | string) => `/logos/avatar-${n}.jpg`;

export const container: React.CSSProperties = {
  width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 28px', boxSizing: 'border-box',
};
export const SKY = 'linear-gradient(180deg, #bcdaf1 0%, #d3e6f5 34%, #eaf2f8 68%, var(--cream) 100%)';
export const softCard: React.CSSProperties = {
  background: '#fff', border: '1px solid rgba(45,37,25,0.07)', borderRadius: 28,
  boxShadow: '0 20px 50px rgba(45,37,25,0.07)',
};

// Wheat mark at natural aspect ratio (portrait PNG — never squash).
export function Mark({ h = 30, style = {} }: { h?: number; style?: React.CSSProperties }) {
  return <img src={MARK} alt="Harvest" style={{ height: h, width: 'auto', display: 'block', ...style }} />;
}

export function Kicker({ children, align = 'center', color = 'var(--warm-brown)' }:
  { children: React.ReactNode; align?: React.CSSProperties['textAlign']; color?: string }) {
  return (
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color, textAlign: align, margin: 0, opacity: 0.75 }}>
      {children}
    </p>
  );
}

// Big section heading — Fraunces, blur-in-up by word.
export function H2({ children, align = 'center', style = {} }:
  { children: React.ReactNode; align?: React.CSSProperties['textAlign']; style?: React.CSSProperties }) {
  return (
    <AnimatedText
      as="h2"
      text={children}
      style={{
        fontFamily: 'var(--font-serif)', fontWeight: 500,
        fontSize: 'clamp(2rem, 4vw, 3.1rem)', lineHeight: 1.06, letterSpacing: '-0.02em',
        color: 'var(--navy-900)', textAlign: align, margin: 0, ...style,
      }}
    />
  );
}

// Checklist — the gold-check feature list used in the split sections.
export function Checklist({ items = [], onDark = false, size = 'md', style = {} }:
  { items?: string[]; onDark?: boolean; size?: 'sm' | 'md'; style?: React.CSSProperties }) {
  const textColor = onDark ? 'var(--text-body-dark)' : 'var(--text-body)';
  const fontSize = size === 'sm' ? 'var(--text-xs)' : 'var(--text-base)';
  const checkSize = size === 'sm' ? 14 : 20;
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: size === 'sm' ? 8 : 16, ...style }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <svg width={checkSize} height={checkSize} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2, color: 'var(--brand)' }} aria-hidden="true">
            <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize, fontWeight: size === 'sm' ? 400 : 500, lineHeight: 1.5, color: textColor }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
