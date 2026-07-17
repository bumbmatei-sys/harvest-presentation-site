import React from 'react';
import { useMeta } from '../lib/meta';
import { Clouds, Reveal } from '../components/effects';
import { Particles, AnimatedText, HBtn } from '../components/magic';
import { Kicker, container, softCard, SKY } from '../components/shared';
import { L } from '../components/icons';

/* /contact — a minimal general-enquiry form for the public marketing site.
   Reuses the landing design language (SKY header band + Clouds + Particles,
   softCard, Reveal, HBtn, the token type scale) rather than inventing one.

   Posts name/email/message to the app's public /api/contact route (cross-origin,
   theharvest.site → theharvest.app), which writes into platform_inbox and emails
   the team. No faith questions — this is a general enquiry. */

const CONTACT_ENDPOINT = 'https://theharvest.app/api/contact';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited';

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

export function ContactPage() {
  useMeta({
    title: 'Contact — Harvest',
    description: 'Questions, feedback, or a partnership idea? Send the Harvest team a message and we’ll get back to you.',
    url: 'https://theharvest.site/contact',
  });

  const [form, setForm] = React.useState({ name: '', email: '', message: '' });
  const [status, setStatus] = React.useState<Status>('idle');
  const [focused, setFocused] = React.useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submitting = status === 'submitting';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (!name || !EMAIL_RE.test(email) || !message || submitting) return;

    setStatus('submitting');
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else if (res.status === 429) {
        setStatus('rate_limited');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const fieldStyle = (name: string): React.CSSProperties => ({
    ...fieldBase,
    border: `1px solid ${focused === name ? 'var(--brand)' : 'transparent'}`,
    boxShadow: focused === name ? '0 0 0 3px rgba(201,150,58,0.15)' : 'none',
  });
  const focusProps = (name: string) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused((f) => (f === name ? null : f)),
  });

  return (
    <main>
      {/* Header band — mirrors the /features header treatment. */}
      <section style={{ position: 'relative', background: SKY, paddingTop: 150, paddingBottom: 132, overflow: 'hidden' }}>
        <Clouds dense />
        <Particles quantity={40} />
        <div style={{ ...container, position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Reveal y={14}><Kicker>We’re here to help</Kicker></Reveal>
          <AnimatedText
            as="h1"
            text={'Get in touch'}
            startOnView={false}
            delay={100}
            stagger={80}
            y={20}
            duration={760}
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--navy-900)', margin: '20px auto 0', maxWidth: 720 }}
          />
          <Reveal delay={360} y={16}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--navy-700)', maxWidth: 520, margin: '18px auto 0', lineHeight: 1.6, opacity: 0.85 }}>
              Questions, feedback, or a partnership idea? Send us a message and we’ll get back to you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Form card — pulled up to straddle the SKY → cream seam. */}
      <section style={{ background: 'var(--cream)', padding: '0 20px var(--section-y-tight)', position: 'relative', zIndex: 2 }}>
        <Reveal y={24} style={{ maxWidth: 600, margin: '-84px auto 0' }}>
          <div style={{ ...softCard, padding: 'clamp(26px, 5vw, 44px)' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gold-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <L name="check" size={28} color="var(--brand)" strokeWidth={2.4} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 26, color: 'var(--navy-900)', margin: 0 }}>Message sent</h2>
                <p style={{ fontSize: 15, color: 'var(--text-body)', lineHeight: 1.6, margin: '12px auto 22px', maxWidth: 380 }}>
                  Thanks for reaching out — we’ve received your message and will get back to you soon.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <HBtn to="/#hero" variant="gold">Back to home</HBtn>
                  <HBtn variant="light" onClick={() => setStatus('idle')}>Send another</HBtn>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                {status === 'error' && (
                  <Banner tone="error" icon="message-square-text" title="Something went wrong">
                    Your message couldn’t be sent. Please try again in a moment.
                  </Banner>
                )}
                {status === 'rate_limited' && (
                  <Banner tone="warn" icon="lock" title="Too many submissions">
                    You’ve sent a few messages already. Please wait a little while before sending another.
                  </Banner>
                )}

                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="contact-name" style={labelCss}>Your name</label>
                  <input
                    id="contact-name" name="name" type="text" required autoComplete="name"
                    placeholder="Jane Doe" value={form.name} onChange={set('name')}
                    style={fieldStyle('name')} {...focusProps('name')}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="contact-email" style={labelCss}>Email</label>
                  <input
                    id="contact-email" name="email" type="email" required autoComplete="email"
                    placeholder="jane@example.com" value={form.email} onChange={set('email')}
                    style={fieldStyle('email')} {...focusProps('email')}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label htmlFor="contact-message" style={labelCss}>Message</label>
                  <textarea
                    id="contact-message" name="message" required rows={5}
                    placeholder="How can we help?" value={form.message} onChange={set('message')}
                    style={{ ...fieldStyle('message'), resize: 'vertical', minHeight: 120, lineHeight: 1.55 }} {...focusProps('message')}
                  />
                </div>

                <HBtn
                  variant="gold"
                  block
                  style={{ opacity: submitting ? 0.65 : 1, pointerEvents: submitting ? 'none' : undefined }}
                >
                  {submitting ? 'Sending…' : 'Send message'}
                </HBtn>

                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', margin: '16px 0 0', lineHeight: 1.5 }}>
                  We’ll only use your details to reply to your enquiry.
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
