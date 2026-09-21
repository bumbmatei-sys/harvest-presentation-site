import React from 'react';
import { HBtn } from './magic';
import { softCard } from './shared';
import { L } from './icons';

/* Shared product-updates / waitlist email capture.
   Posts email (+ optional source) to the app's public /api/waitlist route
   (cross-origin, theharvest.site → theharvest.app), which writes into the
   `product_updates` Firestore collection. This is Harvest PRODUCT news for
   people evaluating the product — never a church newsletter /
   congregational email / SMS surface. NEWSLETTER_MARKETING_ENABLED stays false. */

export const WAITLIST_ENDPOINT = 'https://theharvest.app/api/waitlist';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LeadSource = 'homepage' | 'waitlist';
export type LeadStatus = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited' | 'invalid';

export type LeadCopy = {
  headline: string;
  subcopy: string;
  placeholder: string;
  cta: string;
  finePrint: string;
  successTitle?: string;
  successBody: string;
};

/** Recommended default — homepage band. */
export const HOMEPAGE_LEAD_COPY: LeadCopy = {
  headline: 'Get Harvest product updates',
  subcopy: 'Occasional notes on what we’re shipping and early access — not a church newsletter.',
  placeholder: 'you@church.org',
  cta: 'Get updates',
  finePrint: 'Product updates from Harvest only. Unsubscribe anytime. This is not congregational email.',
  successBody: 'You’re on the list — we’ll email product updates only.',
};

/** Alternate A — /waitlist page. */
export const WAITLIST_LEAD_COPY: LeadCopy = {
  headline: 'Join the Harvest waitlist',
  subcopy: 'Be first to hear when new plans and features open — product news only, not member email.',
  placeholder: 'you@church.org',
  cta: 'Join waitlist',
  finePrint: 'Product updates from Harvest only. Unsubscribe anytime. This is not congregational email.',
  successTitle: 'You’re on the list',
  successBody: 'You’re on the list — we’ll email product updates only.',
};

const labelCss: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
};

const fieldBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', fontSize: 15,
  color: 'var(--navy-900)', background: 'var(--stone-100)', borderRadius: 'var(--radius-lg)',
  padding: '13px 16px', outline: 'none', transition: 'border-color 200ms, box-shadow 200ms',
};

function Banner({ tone, icon, title, children }:
  { tone: 'error' | 'warn'; icon: string; title: string; children: React.ReactNode }) {
  const palette = tone === 'error'
    ? { bg: '#FDECEC', border: '#F5C2C2', fg: '#9B1C1C' }
    : { bg: 'var(--gold-100)', border: 'rgba(201,150,58,0.35)', fg: 'var(--gold-700, #8a6d2f)' };
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex', gap: 11, alignItems: 'flex-start', background: palette.bg,
        border: `1px solid ${palette.border}`, borderRadius: 'var(--radius-lg)', padding: '13px 16px', marginBottom: 20,
      }}
    >
      <L name={icon} size={18} color={palette.fg} style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: palette.fg }}>{title}</div>
        <div style={{ fontSize: 13.5, color: palette.fg, opacity: 0.85, marginTop: 2, lineHeight: 1.5 }}>{children}</div>
      </div>
    </div>
  );
}

type Props = {
  source: LeadSource;
  copy: LeadCopy;
  /** When true, wrap the form in softCard (homepage band / waitlist card). */
  card?: boolean;
  /** Compact layout for the homepage band (no giant success chrome). */
  compact?: boolean;
  idPrefix?: string;
};

export function LeadCaptureForm({
  source,
  copy,
  card = true,
  compact = false,
  idPrefix = 'lead',
}: Props) {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<LeadStatus>('idle');
  const [focused, setFocused] = React.useState(false);

  const submitting = status === 'submitting';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (submitting) return;
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('invalid');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else if (res.status === 429) {
        setStatus('rate_limited');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const fieldStyle: React.CSSProperties = {
    ...fieldBase,
    border: `1px solid ${focused ? 'var(--brand)' : status === 'invalid' ? '#F5C2C2' : 'transparent'}`,
    boxShadow: focused ? '0 0 0 3px rgba(201,150,58,0.15)' : 'none',
  };

  const body = status === 'success' ? (
    <div style={{ textAlign: compact ? 'left' : 'center', padding: compact ? 0 : '10px 0' }}>
      {!compact && (
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--gold-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
        }}>
          <L name="check" size={28} color="var(--brand)" strokeWidth={2.4} />
        </div>
      )}
      {copy.successTitle && !compact && (
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 26, color: 'var(--navy-900)', margin: 0 }}>
          {copy.successTitle}
        </h2>
      )}
      <p
        role="status"
        aria-live="polite"
        style={{
          fontSize: 15, color: 'var(--text-body)', lineHeight: 1.6,
          margin: compact ? 0 : '12px auto 22px', maxWidth: 420,
        }}
      >
        {copy.successBody}
      </p>
      {!compact && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <HBtn to="/#hero" variant="gold">Back to home</HBtn>
          <HBtn variant="light" onClick={() => setStatus('idle')}>Add another</HBtn>
        </div>
      )}
      {compact && (
        <HBtn variant="light" onClick={() => setStatus('idle')} style={{ marginTop: 14 }}>
          Add another
        </HBtn>
      )}
    </div>
  ) : (
    <form onSubmit={onSubmit} noValidate>
      {status === 'error' && (
        <Banner tone="error" icon="message-square-text" title="Something went wrong">
          Something went wrong. Try again in a moment.
        </Banner>
      )}
      {status === 'rate_limited' && (
        <Banner tone="warn" icon="lock" title="Too many submissions">
          You’ve signed up a few times already. Please wait a little while before trying again.
        </Banner>
      )}
      {status === 'invalid' && (
        <Banner tone="error" icon="message-square-text" title="Check your email">
          Enter a valid email address.
        </Banner>
      )}

      <div style={{ marginBottom: 18 }}>
        <label htmlFor={`${idPrefix}-email`} style={labelCss}>Email</label>
        <input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={copy.placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'invalid') setStatus('idle');
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={fieldStyle}
        />
      </div>

      <HBtn
        variant="gold"
        block
        style={{ opacity: submitting ? 0.65 : 1, pointerEvents: submitting ? 'none' : undefined }}
      >
        {submitting ? 'Submitting…' : copy.cta}
      </HBtn>

      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', margin: '16px 0 0', lineHeight: 1.5 }}>
        {copy.finePrint}{' '}
        <a href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy</a>
      </p>
    </form>
  );

  if (!card) return body;
  return (
    <div style={{ ...softCard, padding: compact ? 'clamp(22px, 4vw, 32px)' : 'clamp(26px, 5vw, 44px)' }}>
      {body}
    </div>
  );
}

/** Homepage band — Recommended default microcopy + embedded form. */
export function LeadCaptureBand() {
  return (
    <section
      id="product-updates"
      style={{
        background: 'var(--cream)',
        padding: 'var(--section-y-tight) 0',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 720, margin: '0 auto', padding: '0 28px', boxSizing: 'border-box',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'var(--warm-brown)', textAlign: 'center', margin: 0, opacity: 0.75,
        }}>
          Product updates
        </p>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 500,
          fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-0.02em',
          color: 'var(--navy-900)', textAlign: 'center', margin: '14px 0 0',
        }}>
          {HOMEPAGE_LEAD_COPY.headline}
        </h2>
        <p style={{
          fontSize: 'var(--text-base)', color: 'var(--navy-700)', textAlign: 'center',
          maxWidth: 480, margin: '14px auto 28px', lineHeight: 1.6, opacity: 0.85,
        }}>
          {HOMEPAGE_LEAD_COPY.subcopy}
        </p>
        <LeadCaptureForm
          source="homepage"
          copy={HOMEPAGE_LEAD_COPY}
          compact
          idPrefix="home-lead"
        />
      </div>
    </section>
  );
}
