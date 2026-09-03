import React from 'react';
import { L } from './icons';

/* Concept schematics for /features/coming-soon.
 *
 * 🔴 WHY THESE ARE NOT LIKE components/FeatureMock.tsx. The five live category
 * pages put a still life of the real product beside each feature — a vignette
 * of the actual UI, in that feature's colour, framed with the ministry's name
 * and a "Harvest" tab label. That frame is doing work: it says "this is a
 * screen you will see". None of the features on this page has a screen, so borrowing
 * that frame would be a picture of something that does not exist, which is
 * exactly the false claim this whole page has to avoid.
 *
 * What is drawn instead is a WIREFRAME, and every difference from the live
 * vignettes is deliberate and load-bearing:
 *
 *   · Dashed outlines everywhere, never solid. Dashed already means "not
 *     included" in this codebase — it is what an unlit plan chip uses in
 *     FeatureBlock's PlanChips — so the vocabulary is one a reader of this site
 *     has already been taught.
 *   · Greeked bars in place of words. A mock with real sentences in it reads as
 *     a screenshot; a mock with grey bars reads as a sketch. Nothing here spells
 *     out interface copy, because there is no interface to quote.
 *   · Grey only, from the two `--text-soon` tokens. No category tint, no gold,
 *     no navy. The five live pages are in colour; this one is not, and that is
 *     the whole visual argument.
 *   · Graph-paper ground and no drop shadow. A screenshot floats above the
 *     page; a drawing lies flat on it.
 *   · The frame is captioned "Concept sketch — nothing built" in the markup
 *     itself, so the disclaimer travels with the image rather than sitting in a
 *     caption somebody can crop away.
 *
 * Everything here is decorative and carries aria-hidden: the schematic repeats
 * what the block already says in prose, and a screen reader should get the
 * prose once rather than a pile of unlabelled boxes. */

const INK = 'var(--text-soon)';
const INK_SOFT = 'var(--text-soon-soft)';

/** Graph paper, drawn from the grey token so it tracks the palette. */
export const SKETCH_GROUND: React.CSSProperties = {
  backgroundColor: 'var(--surface-soon)',
  backgroundImage:
    'linear-gradient(var(--soon-rule) 1px, transparent 1px), linear-gradient(90deg, var(--soon-rule) 1px, transparent 1px)',
  backgroundSize: '14px 14px',
};

const dashed = (radius = 8): React.CSSProperties => ({
  border: `1px dashed ${INK_SOFT}`, borderRadius: radius, background: 'transparent',
});

/** A greeked line of "text" — a grey bar, never a real sentence. */
function Bar({ w = '100%', h = 6 }: { w?: number | string; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 999, background: INK_SOFT, flexShrink: 0 }} />;
}

/** A dashed panel with an optional small caption rendered in grey. */
function Panel({ label, children, style = {} }:
  { label?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ ...dashed(10), padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 7, ...style }}>
      {label && (
        <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: INK }}>{label}</span>
      )}
      {children}
    </div>
  );
}

/** A dashed pill — the schematic's stand-in for a control. */
function Pill({ children, w }: { children?: React.ReactNode; w?: number }) {
  return (
    <span style={{ ...dashed(999), width: w, padding: '4px 9px', fontSize: 9, fontWeight: 600, color: INK, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 7 };

/** A stack of greeked rows — the generic "list of things" schematic. */
function Rows({ n = 3, lead }: { n?: number; lead?: boolean }) {
  return (
    <div style={col}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ ...row, opacity: 1 - i * 0.16 }}>
          {lead && <span style={{ ...dashed(5), width: 15, height: 15, flexShrink: 0 }} />}
          <Bar w={`${86 - i * 13}%`} />
        </div>
      ))}
    </div>
  );
}

const SKETCHES: Record<string, React.ReactElement> = {
  /* Two language columns of the same greeked content, side by side. */
  languages: (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
      <Panel label="en"><Rows n={3} /></Panel>
      <Panel label="—"><Rows n={3} /></Panel>
    </div>
  ),
  /* A run sheet: timed rows down the left, a roster block beneath. */
  services: (
    <div style={col}>
      <Panel label="Order of service">
        {[0, 1, 2].map((i) => (
          <div key={i} style={row}>
            <span style={{ ...dashed(4), width: 26, height: 12, flexShrink: 0 }} />
            <Bar w={`${72 - i * 14}%`} />
          </div>
        ))}
      </Panel>
      <div style={{ ...row, gap: 6, flexWrap: 'wrap' }}><Pill>Team</Pill><Pill>Songs</Pill><Pill>Rehearsal</Pill></div>
    </div>
  ),
  /* A three-column pipeline — the review stages an application moves through. */
  applications: (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
      {['New', 'Review', 'Decision'].map((s, i) => (
        <Panel key={s} label={s} style={{ padding: '8px 7px' }}>
          {Array.from({ length: 3 - i }, (_, j) => <Bar key={j} w="100%" h={13} />)}
        </Panel>
      ))}
    </div>
  ),
  /* A docs site: a nav rail beside an article. */
  docs: (
    <div style={{ display: 'grid', gridTemplateColumns: '0.42fr 1fr', gap: 9 }}>
      <Panel style={{ padding: '8px 8px' }}><Rows n={4} /></Panel>
      <Panel style={{ padding: '9px 10px' }}>
        <Bar w="62%" h={9} />
        <Rows n={3} />
      </Panel>
    </div>
  ),
  /* A page canvas with an unbound block palette down the side. */
  website: (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.34fr', gap: 9 }}>
      <div style={col}>
        <span style={{ ...dashed(8), height: 34 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
          <span style={{ ...dashed(8), height: 26 }} /><span style={{ ...dashed(8), height: 26 }} />
        </div>
      </div>
      <Panel style={{ padding: '7px 6px', gap: 6 }}>
        {[0, 1, 2].map((i) => <span key={i} style={{ ...dashed(5), height: 13 }} />)}
      </Panel>
    </div>
  ),
  /* An instruction queue, not a chat transcript — the distinction the copy makes. */
  agent: (
    <div style={col}>
      <Panel label="Queue">
        {[0, 1, 2].map((i) => (
          <div key={i} style={row}>
            <span style={{ ...dashed(999), width: 13, height: 13, flexShrink: 0 }} />
            <Bar w={`${78 - i * 16}%`} />
          </div>
        ))}
      </Panel>
      <div style={{ ...row, gap: 6, flexWrap: 'wrap' }}><Pill>Admin only</Pill><Pill>Acts</Pill></div>
    </div>
  ),
  /* One identity node, two church memberships hanging off it. */
  identity: (
    <div style={col}>
      <Panel style={{ alignItems: 'center', padding: '9px 8px' }}>
        <span style={{ ...dashed(999), width: 26, height: 26 }} />
        <Bar w="46%" />
      </Panel>
      <div style={{ display: 'flex', justifyContent: 'center', color: INK_SOFT, fontSize: 11 }} aria-hidden="true">⌄</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        <Panel style={{ padding: '8px 7px' }}><Bar w="80%" /><Bar w="55%" /></Panel>
        <Panel style={{ padding: '8px 7px' }}><Bar w="80%" /><Bar w="55%" /></Panel>
      </div>
    </div>
  ),
  /* A fund selector above an amount field — both blank. */
  designations: (
    <div style={col}>
      <Panel label="Fund">
        <div style={{ ...row, gap: 6, flexWrap: 'wrap' }}>
          <Pill>General</Pill><Pill>Missions</Pill><Pill>Building</Pill>
        </div>
      </Panel>
      <Panel label="Amount"><span style={{ ...dashed(7), height: 22 }} /></Panel>
    </div>
  ),
  /* A month grid with three cells spoken for, and a queue beneath it.
     🔴 NO PLATFORM MARK, AND NO CAPTION NAMING ONE. The obvious drawing for a
     scheduler is a row of recognisable logos down the side of a calendar, and
     every one of those is a third party's trademark drawn into markup that
     ships under Harvest's name — the thing board card 86bbrgp08 exists to
     stop. The destinations are named in prose on the page itself, with marks
     hotlinked and `alt=""`; the sketch draws only the SHAPE — some days have
     something on them, and a queue holds the order. */
  scheduler: (
    <div style={col}>
      <Panel label="Month">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {Array.from({ length: 21 }, (_, i) => (
            <span key={i} style={{ ...dashed(3), height: 12, background: [3, 9, 16].includes(i) ? INK_SOFT : 'transparent' }} />
          ))}
        </div>
      </Panel>
      <Panel label="Queue">
        {[0, 1, 2].map((i) => (
          <div key={i} style={row}>
            <span style={{ ...dashed(4), width: 22, height: 12, flexShrink: 0 }} />
            <Bar w={`${74 - i * 15}%`} />
          </div>
        ))}
      </Panel>
    </div>
  ),
  /* 🔴 A LINK, A CHURCH, AND A SPAN OF MONTHS — and deliberately NOT an earnings
     screen. The obvious drawing for an affiliate programme is a dashboard: a
     balance, a this-month figure, a chart climbing. Every one of those is a
     number nobody can be shown yet, and a wireframe of one still reads as "this
     exists and here is roughly what you would see". So the schematic depicts
     only what would be TRACKED — a link, the church that arrived on it, and the
     twelve cells of the window — with no figure, no currency and no chart
     anywhere in it. The prose carries the terms; the picture carries none. */
  affiliate: (
    <div style={col}>
      <Panel label="Link"><Bar w="72%" /></Panel>
      <div style={{ display: 'flex', justifyContent: 'center', color: INK_SOFT, fontSize: 11 }} aria-hidden="true">⌄</div>
      <Panel label="Church"><Bar w="80%" /><Bar w="52%" /></Panel>
      {/* Twelve cells, on `1fr` tracks with no content in them, so the strip
          shrinks with the frame instead of setting a floor under it. */}
      <Panel label="Months">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
          {Array.from({ length: 12 }, (_, i) => <span key={i} style={{ ...dashed(3), height: 12 }} />)}
        </div>
      </Panel>
    </div>
  ),
};

/** The schematic for one coming-soon id. Unknown ids fall back to a plain
 *  wireframe rather than throwing — a missing sketch should not take the page
 *  down, and the block's prose carries the meaning either way. */
export function SoonMock({ id }: { id: string }) {
  return (
    // Tall enough to balance the story column beside it. The live vignettes in
    // FeatureMock are screenshots of real, dense UI; a wireframe is sparser, so
    // it needs a floor or the card reads as half-empty at desktop widths.
    <div aria-hidden="true" style={{ minHeight: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {SKETCHES[id] ?? <Panel><Rows n={3} lead /></Panel>}
    </div>
  );
}

/** The item's own icon, in grey, for the block heading and the page index. */
export function SoonIcon({ name, size = 21 }: { name: string; size?: number }) {
  return <L name={name} size={size} color="currentColor" />;
}
