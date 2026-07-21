import React from 'react';
import { Reveal } from './effects';
import type { Plan } from './Pricing';

/* Interactive savings calculator for the pricing page. Two sliders — monthly
   donation volume and plan tier — drive a live "what your church keeps" figure.
   Fee/retention numbers come from the shared `plans` constant (passed in), the
   same source the pricing cards and comparison table read, so the calculator can
   never quote a fee that disagrees with the rest of the page (or the app). */

const VOLUME_MIN = 0;
const VOLUME_MAX = 50000;
const VOLUME_STEP = 500;

// Whole dollars where possible; up to 2 decimals for the 2.5% tier (e.g. $12.50).
function money(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function FeeCalculator({ plans }: { plans: Plan[] }) {
  const [volume, setVolume] = React.useState(5000);
  const [tierIdx, setTierIdx] = React.useState(1); // default to the popular Small Team

  const tier = plans[tierIdx];
  const feeAmount = volume * tier.fee;
  const kept = volume - feeAmount;

  // Upsell delta: compare against the highest-fee (baseline) tier, so the saving
  // GROWS as you climb — Community shows the 2.5-pt saving, Ministry shows the full
  // 5-pt saving. Derived from the data so a future fee change can't desync it.
  const baselineFee = Math.max(...plans.map(p => p.fee));
  const extraKept = tier.fee < baselineFee ? volume * (baselineFee - tier.fee) : 0;

  const feePct = (tier.fee * 100).toLocaleString('en-US', { maximumFractionDigits: 2 });

  return (
    <Reveal delay={80}>
      <div
        className="fee-calc"
        style={{
          marginTop: 20, borderRadius: 24, background: 'var(--navy-900)',
          padding: 'clamp(22px, 4vw, 34px)', color: '#fff', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-400)', opacity: 0.9 }}>
              Savings calculator
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', margin: '8px 0 0', lineHeight: 1.15 }}>
              See what your church keeps
            </h3>
          </div>

          {/* Slider 1 — monthly donation volume */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <label htmlFor="fc-volume" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Monthly donations</label>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--gold-400)' }}>{money(volume)}<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>/mo</span></span>
            </div>
            <input
              id="fc-volume"
              type="range"
              min={VOLUME_MIN}
              max={VOLUME_MAX}
              step={VOLUME_STEP}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Monthly donation volume"
              aria-valuetext={`${money(volume)} per month`}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              <span>{money(VOLUME_MIN)}</span>
              <span>{money(VOLUME_MAX)}+</span>
            </div>
          </div>

          {/* Slider 2 — plan tier (full ladder) */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <label htmlFor="fc-tier" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Your plan</label>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#fff' }}>
                {tier.name} <span style={{ color: 'var(--gold-400)', fontSize: 14 }}>· {feePct}% fee</span>
              </span>
            </div>
            <input
              id="fc-tier"
              type="range"
              min={0}
              max={plans.length - 1}
              step={1}
              value={tierIdx}
              onChange={(e) => setTierIdx(Number(e.target.value))}
              aria-label="Plan tier"
              aria-valuetext={`${tier.name}, ${feePct}% platform fee`}
            />
            {/* Tier labels track the range thumb. The 26px thumb's centre travels
                from 13px to (100% − 13px), so each label is positioned over its stop
                in that same coordinate system: the two ends are anchored inward by
                the 13px thumb inset (first left-aligned, last right-aligned so they
                don't overflow the container edge) and the middle stops are centred.
                Thumb + label stay aligned at every stop, desktop and mobile. */}
            <div style={{ position: 'relative', height: 22, marginTop: 8 }}>
              {plans.map((p, i) => {
                const last = plans.length - 1;
                const frac = last > 0 ? i / last : 0; // 0, ⅓, ⅔, 1 for four tiers
                const isFirst = i === 0;
                const isLast = i === last;
                // Thumb centre at this stop: 13px + frac·(100% − 26px), written in
                // distributed form to avoid nested calc() for broad browser support.
                const left = `calc(${(13 - frac * 26).toFixed(3)}px + ${(frac * 100).toFixed(3)}%)`;
                return (
                  <button
                    key={p.planId}
                    type="button"
                    onClick={() => setTierIdx(i)}
                    style={{
                      position: 'absolute', top: 0, left,
                      transform: isFirst ? 'none' : isLast ? 'translateX(-100%)' : 'translateX(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                      whiteSpace: 'nowrap',
                      textAlign: isFirst ? 'left' : isLast ? 'right' : 'center',
                      fontFamily: 'var(--font-sans)', fontSize: 10.5, lineHeight: 1.3,
                      fontWeight: i === tierIdx ? 700 : 500,
                      color: i === tierIdx ? 'var(--gold-400)' : 'rgba(255,255,255,0.45)',
                      transition: 'color 200ms',
                    }}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live result */}
          <div style={{ textAlign: 'center', padding: '22px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Your church keeps</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.6rem, 8vw, 3.6rem)', fontWeight: 500, color: '#fff', lineHeight: 1.05, margin: '6px 0' }}>
              {money(kept)}<span style={{ fontSize: '0.4em', color: 'rgba(255,255,255,0.5)' }}>/mo</span>
            </div>
            {extraKept > 0 && (
              <div style={{ marginTop: 14, display: 'inline-block', background: 'rgba(201,150,58,0.16)', color: 'var(--gold-400)', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 999 }}>
                You keep {money(extraKept)} more per month on {tier.name}
              </div>
            )}
          </div>

          {/* Honest footnote — the platform fee is Harvest's cut only. */}
          <p style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, textAlign: 'center', maxWidth: 520, marginInline: 'auto' }}>
            Shows Harvest&rsquo;s platform fee only. Stripe&rsquo;s standard card-processing fees are separate and still apply to each gift.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
