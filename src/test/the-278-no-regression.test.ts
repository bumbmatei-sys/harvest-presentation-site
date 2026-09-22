/**
 * THE-278 — the guard half. Its sibling proves Tailwind works; this file proves
 * it changed NOTHING that already existed.
 *
 * 🔴 THE WHOLE RISK OF THE TICKET IS HERE. Adding a utility framework beside 42
 * components already styled by one 400-line stylesheet is where specificity
 * fights start, and the failure mode is silent: a page that shifted by 2px, a
 * heading that lost its serif, a list that lost its bullets. Tailwind's
 * Preflight alone would do all three.
 *
 * So nothing here is judged by eye. Every page the site prerenders is
 * fingerprinted from the BUILT html, and the stylesheet's original 400 lines are
 * pinned by hash as a contiguous region of the file they still live in.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { blogRoutes } from '../../build/blog-plugin';
import { plans, planPriceContract, type Plan } from '../components/Pricing';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');

const DIST = path.join(ROOT, 'dist');
const built = existsSync(path.join(DIST, 'index.html'));

/**
 * ⚠️ A win32 CHECKOUT BUILDS A DIFFERENT SITE, and not because of this ticket.
 *
 * `slugFromPath` in src/content/post-core.ts is `path.split('/').pop()`. On
 * POSIX that is the filename; on win32, where `postFiles()` hands it
 * `...\src\content\posts\work-that-outlives-you.md`, there is no '/' to split
 * on, so the slug becomes the whole absolute path. The three post routes then
 * never match, the build emits 18 pages instead of 21, and the blog index
 * renders an empty list.
 *
 * Pre-existing, POSIX-correct and out of scope here — production and CI both
 * build on Linux, where all 21 pages are emitted and correct, which is where
 * the fingerprints below were taken. A comparison that would measure the broken
 * local build rather than this ticket skips; the page count still asserts, so a
 * broken build says so instead of quietly agreeing with itself.
 */
const postPagesBuilt = existsSync(path.join(DIST, 'blog', 'work-that-outlives-you', 'index.html'));
const comparable = built && postPagesBuilt;

/* ═══ 6 — no existing page's rendered output changed ══════════════════════ */
describe('6 — the built pages are byte-identical to the pre-Tailwind build', () => {
  /**
   * Content-hashed asset filenames move because the stylesheet grew, which is
   * the point of the ticket. Everything else in the markup must not move at
   * all, so the hashes are normalised away and nothing else is.
   */
  const normalise = (html: string) =>
    html
      .replace(/-[A-Za-z0-9_-]{6,}\.(css|js|json)/g, '-HASH.$1')
      /* ⚠️ AND the SSG nonce. vite-react-ssg stamps every page with
         `Math.random().toString(36).substring(2, 12)` (see its dist bundle), so
         two builds of byte-identical source disagree here. Comparing it would
         measure the RNG, and the test would fail on a no-op rebuild. */
      .replace(/__VITE_REACT_SSG_HASH__ = '[^']*'/g, "__VITE_REACT_SSG_HASH__ = 'NONCE'");

  /**
   * EVERY prerendered page, captured from a CI build of pristine `main` at
   * 15876ff — before a line of this ticket existed, on the same Linux runner
   * that builds production. Not a sample: all 21, so a moved page has nowhere
   * to hide.
   *
   * ─── 🔴 ONE ENTRY HAS MOVED SINCE, AND ON PURPOSE — THE-281 ────────────────
   *
   * `features/giving-finance/index.html` now carries a sixth section, the
   * Shareable Giving Page feature. THE-281 added it to content/features.ts, so
   * the page it renders on legitimately changed and its fingerprint had to be
   * retaken; `BASELINE_ALL` moved with it, since it is the same 21 pages hashed
   * as one number.
   *
   * ⚠️ THE OTHER TWENTY DID NOT MOVE, and that is the assertion that still
   * matters. This table's job was never "no page may ever change" — a content
   * site whose pages cannot change is a site nobody can edit. Its job is that a
   * change is DELIBERATE and SCOPED: THE-278 proved installing Tailwind moved
   * nothing, and this run proves adding one feature moved exactly the one page
   * that feature is on. A second entry changing in the same commit would have
   * been the bug, and it would still have failed here.
   *
   * Retaken on Linux, from the same `npm run build`, at the commit that added
   * the section.
   */
  const PRE_TAILWIND: Readonly<Record<string, string>> = {
    'blog/category/harvest-vs/index.html': '39f910d46af70402edd9a5ab8be5338cd577ecaf6e3287b44a1013795689b13d',
    'blog/category/inside-harvest/index.html': '8481746c2169c2dbc063f6137f40d99c4df243a441d8902ad1f73b1d6c9d133f',
    'blog/category/rooted/index.html': '5fbc9f2bc14cd54173b67b0bebe7e759ae329f6106e426d18d7acb80f6061231',
    'blog/generosity-without-pressure/index.html': 'af09661bf1f1da1551351b02c0f07195cd45c02c10bbf2c9d7dd6f23c41890e8',
    'blog/index.html': '54fa1b832e5829f4f6b7064277db1970f6189dc386f5072ccf984652d97154cf',
    'blog/planning-center-alternative-small-churches/index.html': '78bdcafc4bcb7e296e67f59a2f3ad65d19b1e0b5d554c5acd5c93d1335d435d5',
    'blog/work-that-outlives-you/index.html': '8ead55954bbeb64c0120af872bdd492f44b23ff47f24a2c879621bed722fa718',
    'contact/index.html': '28ac199c12eb693194b17b66066a237cba78bf208375f331527f3c33e3dec007',
    'faq/index.html': '4c8e02fc232e019dc077f47d6a35e017596ce737f5f6a531f2bb1f3dc67bbfc3',
    'features/ai-automation/index.html': '1bb9a1aeac6668a90abac06167aa6c8ac4bb8f50233aae26081a23c35857e410',
    'features/coming-soon/index.html': '81bae956e72ca69a50ebc3cea88306df5e63818e6ee64b62635eba1a4f41614c',
    'features/community-engagement/index.html': 'fbd2b0a883c5af11db5a498d876e2affb0c5574b67d984ec8f422aaff74ceb4f',
    'features/discipleship-content/index.html': '25170dd7a85ecacdebc18257ac6b3b46334e839ff9cb6dcee006cc2a7484790d',
    'features/giving-finance/index.html': '7e502fcb4984e07bc3cd01671f10eb498ad609671a5f0d2b39f9eeeb03dac3cd',
    'features/index.html': 'efd67e4a5a2e891cd580496ddd78dbac5b4fbcdf550d4557a70fbed2fd3e11a0',
    'features/platform-brand/index.html': '05d5604e150dd512963c76b63159dcbceacf231cde46f598be295ed6da6e261d',
    'index.html': '8e5a076696ccb2927d189fa30ddaabffb374860b2bbb2eded503e20fc2f79101',
    'pricing/index.html': '454c1602e41a0317ac1ffa1db44771be6b4e8ecef243aad1d7237b314b96c2c7',
    'privacy/index.html': 'c85289d0c324e911ca2b6bb353cb01e7bf1ad51bf640f7f44dd689afbf0f7829',
    'refunds/index.html': '05c736525205ec59180e69ed1d9c307e0f2eaedebaed0794cf7f5722f2422b60',
    'terms/index.html': '11959c4b9eee58ccdc856ee585169d6687427d0da7399d60b282f4a318e968b5',
  };

  /**
   * 🔴 THE-280 — the SIX pages that moved since, and the only six.
   *
   * THE-278's claim is "Tailwind changed nothing", and it still holds: every
   * page above is the pre-Tailwind fingerprint, and fifteen of the twenty-one
   * still match it exactly. What moved is what a LATER ticket deliberately
   * changed — recorded here as an explicit delta rather than by overwriting the
   * baseline, so a reader can see at a glance which pages a copy change touched
   * and satisfy themselves that no other page came along for the ride.
   *
   * THE-280 hid custom domains: the feature shipped a panel and was never
   * activated, because the Vercel subscription behind it was never bought, so a
   * church that saved a domain got DNS records pointing nowhere. The app now
   * refuses the write path, and the site had to stop selling what the app
   * refuses. These six pages are exactly the marketing surfaces
   * `CUSTOM_DOMAIN_MARKETING_ENABLED` gates, one for one:
   *
   *   · index            — the "Branding & Domain" caption in the #replaces row
   *   · pricing          — the Custom Domain comparison-table row, withheld
   *   · features/platform-brand — the `branding` entry, reworded not withdrawn
   *   · features/coming-soon    — the new "Custom domains" entry
   *   · faq, terms       — the two answers that named it as a live capability
   *
   * ⚠️ THE PAGE COUNT DID NOT MOVE — still 21, asserted in section 9 and pinned
   * again by LegalPage.test.ts. No page was added or dropped; six changed
   * content.
   *
   * ⚠️ FLIPPING THE FLAG BACK MOVES THESE SIX AGAIN, and this file will need
   * repinning when it happens. That is the standing property of a build
   * fingerprint, not something THE-280 introduced: any copy change moves it.
   */
  const THE_280_MOVED: Readonly<Record<string, string>> = {
    'faq/index.html': '33f593ece1d572f8981dfc0ca141f70c0a4930bf553a8351bcd1da1dc7e3337e',
    'features/coming-soon/index.html': 'ec7702252d9d99660393a1be499f007f6e23706c20813d8c14431966fa4b1c1f',
    'features/platform-brand/index.html': '29156da7546b00db679f260ad28f1c0bac745c72731eefdab9140cc9326c00ce',
    'index.html': '263e63b5ac5f6e4d73964768c2dbab487b336bc8b41d5c99ce0c8edbde0cee4a',
    'pricing/index.html': '4057fa7b8d185e0e864ca70c7dc35e6dd2d6d38b20841c4050ba2385b1fa8b02',
    'terms/index.html': 'f76fa0f81d8fa7a1d5cdbadfb24416ad7cfea843196bc69b9d0cc3a353ac44ac',
  };

  /**
   * 🔴 THE-284 — the ONE page that moved, and the ONE that was added.
   *
   * The Harvest Scheduler went onto the Coming Soon list and got a page of its
   * own, at the founder's direction. Two consequences, and only two:
   *
   *   · features/coming-soon — a twelfth entry, so a twelfth index card and a
   *     twelfth block. This page is the one the entry renders on, so it is the
   *     one page whose content legitimately changed.
   *   · features/harvest-scheduler — the new page. Recorded here rather than
   *     left out, so it is fingerprinted from its first commit like every other
   *     page, and a later edit to it shows up as a move rather than as nothing.
   *
   * ⚠️ AND THE OTHER TWENTY DID NOT MOVE — not the landing page, not the nav on
   * any of them. Adding an entry to `COMING_SOON_ITEMS` also adds an item to
   * `CATALOG`, which is the Features mega-menu on EVERY page; the menu is
   * rendered behind React state that nothing sets during the prerender, so it
   * is not in the built markup and no other page saw the change.
   *
   * 🔴 THIRTEEN PAGES *DID* MOVE IN AN EARLIER DRAFT OF THIS TICKET, and the
   * cause is worth recording because it will recur. The new route was written
   * beside the Coming Soon route, in the middle of the table in src/App.tsx.
   * React-router derives a route's id from its POSITION when none is given, and
   * vite-react-ssg serialises those ids into every page as
   * `window.__staticRouterHydrationData` — so inserting mid-table renumbered
   * every later route and rewrote /contact, /faq, the three policies and all
   * seven blog pages, each by a single digit, with no content change at all.
   * The route is appended above the catch-all instead. See the note in
   * src/App.tsx: add future routes there too.
   */
  const THE_284_MOVED: Readonly<Record<string, string>> = {
    'features/coming-soon/index.html': '333cf879bbaf80f090e9e8a66d42ec7f01b9380dc7e8718586875ff8bd2852f6',
  };
  const THE_284_ADDED: Readonly<Record<string, string>> = {
    'features/harvest-scheduler/index.html': 'a33341141516f3d5279867a0efdcbc0bb42d6a1b5afd6345e61ed7ed37b49975',
  };

  /**
   * 🔴 THE-293 — the ONE page that moved, and nothing was added or dropped.
   *
   * The founder's verdict on the page THE-284 shipped was "the harvest
   * scheduler is horrible. I want for each feature to be presented as the other
   * category pages with a small design." Its six capabilities were six
   * identical grey cards; they are now six `FeatureBlock`s, each with a vignette
   * of its own in components/FeatureMock.tsx — the same component and the same
   * gallery the five live category pages draw from.
   *
   * ⚠️ THE PAGE COUNT DID NOT MOVE, and could not have: no route was added. The
   * note in src/App.tsx about appending above the catch-all is about a route
   * this ticket never needed — THE-284's early draft renumbered thirteen pages
   * by inserting one mid-table, and the reason nothing of the sort appears in
   * this table is that no route was touched at all.
   *
   * 🔴 AND THE FIVE LIVE CATEGORY PAGES DID NOT MOVE EITHER, which is the
   * assertion that was genuinely at risk. Drawing the capabilities through the
   * REAL `FeatureBlock` meant editing a component that /features/ai-automation
   * and its four siblings all render four times each. The new behaviour is
   * behind an `unbuilt` prop that defaults to false, so their markup is
   * byte-identical — and "byte-identical" is this table's word, not a reviewer's
   * impression. A component edit that leaked would show up here as five more
   * entries, and there are none.
   */
  const THE_293_MOVED: Readonly<Record<string, string>> = {
    'features/harvest-scheduler/index.html': '615acfc0897c2a6c8f16a4c81cee2bf2b232c75fb9efd54f6cff4722597034a9',
  };

  /**
   * 🔴 THE-301 — the TWO pages that moved, and nothing was added or dropped.
   *
   * Two Tailark marketing blocks were adopted onto the site's own ramps, one
   * per page, and these are the only two surfaces either of them renders on:
   *
   *   · features        — the no-JS fallback under <Navigate>. It was an <h1>,
   *     one sentence and five unlabelled pills, and it built to 11.34 KiB
   *     against 80–128 KiB for every other page. It is now `veil-content-3`,
   *     listing the five categories with the catalogue's own `seo` line under
   *     each. The redirect itself, the noindex,follow and the canonical are
   *     untouched — only what renders underneath changed.
   *   · contact         — the page was a header band and a form card and then
   *     nothing. `veil-content-1` closes it on three routes that already exist.
   *
   * ⚠️ THE PAGE COUNT DID NOT MOVE, and could not have: no route was added, so
   * the note in src/App.tsx about appending above the catch-all never came into
   * play. Still 22, asserted in section 9 and again by LegalPage.test.ts.
   *
   * 🔴 AND NO SHARED COMPONENT WAS TOUCHED, which is the assertion that was
   * genuinely at risk here. Both blocks are new files; neither page's edit
   * reaches Nav, Footer, FeatureBlock or anything else the other twenty pages
   * render. A leak would show up below as a third entry, and there is none.
   *
   * ⚠️ WHERE THESE HASHES CAME FROM. Regenerated from a fresh `npm run build`,
   * not copied out of a CI log. A win32 checkout normally builds a DIFFERENT
   * site — 19 pages, for the `slugFromPath` reason at the top of this file — so
   * the build they were taken from had that one function made
   * platform-agnostic for the duration, which is a no-op on POSIX and therefore
   * produces exactly the tree Linux produces. That was verified before these
   * values were trusted: the same procedure applied to pristine `main`
   * reproduces every entry in the three tables above AND the previous
   * BASELINE_ALL, b7dc6e67…, exactly. The temporary change is not in this
   * branch; src/content/post-core.ts is untouched.
   */
  const THE_301_MOVED: Readonly<Record<string, string>> = {
    'contact/index.html': '1068a25dfeab69aa441daadda1b67ee31475463900a23252aa63bf4f3d61861d',
    'features/index.html': '2e40c4060f6f9cbc22957bcca3de4626cfe483a03b63fa76ecec79c5b45d958e',
  };

  /**
   * 🔴 THE-306 — the THREE pages that moved, and why two of them are not a leak.
   *
   * The Shareable Giving Page shipped in THE-281 with copy and no picture: no
   * entry in components/FeatureMock.tsx, so `FeatureBlock` drew its frame around
   * an empty panel, and no `FEATURE_ICONS` entry, so the badge beside its
   * eyebrow was an empty coloured square. The founder, on the live page: "is
   * horrible." It also had no row in components/catalog.ts, so it was
   * unreachable from the Features mega-menu.
   *
   *   · features/giving-finance — the page the feature's section is on, and the
   *     only page any of the new MARKUP renders on. Its diff is 59 lines added
   *     and NONE removed: the icon svg, and the vignette inside the frame that
   *     was already there.
   *
   * ─── 🔴 AND THE OTHER TWO, WHICH ARE ONE CHARACTER EACH ────────────────────
   *
   *   · index, pricing — both render `Features.tsx`'s footnote, "N tools across
   *     community, discipleship, giving and AI". N is `CATALOG_TOOL_COUNT`, a
   *     reduce over the catalogue, and adding a live tool to the menu moves it
   *     27 → 28. Each page's normalised diff is exactly one line, and the only
   *     difference on it is that digit.
   *
   * ⚠️ THIS IS THE DERIVED FIGURE WORKING, NOT A COMPONENT LEAKING. The count
   * is deliberately not written down anywhere — the alternative is a hardcoded
   * number that goes stale, which is precisely the defect THE-306 also fixed
   * (catalog.ts said "the count is unchanged at 28" while the menu rendered
   * "27 tools in one platform"). A ticket that adds a tool and moves NO page
   * would mean the figure had stopped being derived.
   *
   * ⚠️ THE MEGA-MENU ITSELF STILL MOVES NOTHING, which is the reassurance
   * THE-284's note above gives for the same reason: the menu renders behind
   * React state that nothing sets during the prerender, so the new row is not
   * in the built markup of any page. Only the footnote's digit is.
   *
   * 🔴 AND THE OTHER NINETEEN DID NOT MOVE. FeatureMock.tsx is rendered four to
   * six times by each of the five live category pages plus the scheduler page;
   * an edit that reached past the one new key would have shown up here as more
   * entries, and there are none.
   *
   * Regenerated from a fresh `npm run build` on Linux, the same procedure the
   * note on THE_301_MOVED describes.
   */
  const THE_306_MOVED: Readonly<Record<string, string>> = {
    'features/giving-finance/index.html': 'e4cf1fe453ae1a4d8d6fdc3dc61314e90ebc61e340e1627368fb355de7d5f628',
    'index.html': '8c0c767b0a0c6b32ba0f6bdde5c90348bdfdbfc30b00390b5fb6fd707bf8dafc',
    'pricing/index.html': '8c098797fa914689605a65bb54b040e67fa6b8f1ec6447143e6fe018808abc01',
  };

  /**
   * 🔴 THE-314 MOVED EIGHT PAGES — the SMS flip, NAMED rather than counted.
   *
   * Turning `SMS_MARKETING_ENABLED` on is one value, and this table is what
   * that one value actually cost. Each entry has a reason, and every reason is
   * a surface the flag is documented as governing:
   *
   *   · features/ai-automation  the SMS feature section renders again — the
   *                             largest single change, and the one the flag
   *                             exists for.
   *   · features/coming-soon    the SMS entry LEAVES. The relocation running
   *                             backwards: sold on the pricing page and called
   *                             unbuilt here would be the same claim twice.
   *   · pricing                 the Ministry card gains its SMS line and the
   *                             comparison grid gains its row — 🔴 on Ministry
   *                             ALONE, which is the tier claim THE-314 verifies
   *                             against the app rather than restating.
   *   · index (home)            the Replaces section lists SMS in Automation
   *                             and DROPS Twilio from the integrations row —
   *                             two changes on one page, both from reselling.
   *   · features                the category index carries the footnote whose
   *                             digit is CATALOG_TOOL_COUNT, 28 → 29.
   *   · features/giving-finance the CRM feature's SMS crosslink resolves again,
   *                             and the same footnote digit moves.
   *   · faq                     the messaging answer stopped saying Harvest
   *                             cannot text, and stopped saying it does not
   *                             resell — which is now the opposite of true.
   *   · privacy                 the data-flow sentence: a text goes through
   *                             Harvest's provider under Harvest's agreement,
   *                             not the church's own carrier account.
   *
   * 🔴 AND TERMS DID NOT MOVE, which is worth stating because it looks like it
   * should have. The Terms bullet describing SMS as a service a church connects
   * itself was WITHHELD while the flag was off and is now DELETED, so the
   * rendered document is identical either way. What replaces it is a legal
   * ticket's wording, not this one's.
   *
   * Regenerated from a fresh `npm run build` on Linux, the same procedure the
   * note on THE_301_MOVED describes.
   */
  const THE_314_MOVED: Readonly<Record<string, string>> = {
    'faq/index.html': 'c89948de023409d50db91e5a732f901b87132284ae941a81c2ce147060cbe4a6',
    'features/ai-automation/index.html': '0e29d1a619d35fd8f084dbc194dba83e97e96c8c6a176d995802e299f5645ac1',
    'features/coming-soon/index.html': '1e0615a64e5c3a552be7ea7be3c7ced91c295e9ac5efcd05bb20a2d491954cc7',
    'features/giving-finance/index.html': '66559aad70db193cb8aba3446e06d6a54dd89a064d1af67eb1e5ca78864b08ac',
    'features/index.html': 'ccc9c87eebb035d209f338fb4ec0bf61e427e870c14deeaa826f1a376c4bd0cd',
    'index.html': '22a1a888afb35bb9b5abff13206702b8f0848c0bf0505a69a89928ecae7617bf',
    'pricing/index.html': '14c17366a4d8a65e95ce0e0afed6d67343370c198a10ad5722658e129b4faf03',
    'privacy/index.html': 'f2122a8337fb0ba29e017d9a666ab083d45dd1c88bb9c8c7254118b08ab0bae4',
  };

  /**
   * 🔴 THE-335 — the ten pages that moved, retaken from a Linux build of this
   * branch, and every one of them explained by a change this ticket made:
   *
   *   · `features/ai-automation` — the SMS section and BOTH newsletter sections
   *     left it, behind SMS_MARKETING_ENABLED and NEWSLETTER_MARKETING_ENABLED.
   *   · `features/community-engagement` — service planning ARRIVED as a live
   *     feature, and the category headline went from seven ways to eight.
   *   · `features/giving-finance` — the accounting entry is reworded off
   *     QuickBooks (name, title, oneliner, moment and one bullet), and the SEO
   *     line with it.
   *   · `features/coming-soon` — the SMS entry came back, a Newsletter entry
   *     arrived, and the services entry narrowed to the worship half.
   *   · `features/index` and `contact` — both render the feature CATEGORIES,
   *     which gained one entry and lost three.
   *   · `index` and `pricing` — the plan cards and the comparison grid: free
   *     swapped CRM for Signups, and the SMS, newsletter and QuickBooks lines
   *     went behind their flags.
   *   · `faq` — the messaging answer, the what-is-in-each-plan answer and the
   *     export answer each stopped naming something the app now refuses.
   *   · `privacy` — `content/legal.ts` gates its SMS paragraph and its section
   *     heading on the flag, so both went dormant.
   *
   * 🔴 AND THE TWELVE THAT DID NOT MOVE ARE THE EVIDENCE. `terms` is the one
   * worth naming: THE-314 REMOVED a false SMS bullet from it and added nothing,
   * so there is no dormant SMS clause in the Terms to withdraw — the whole of
   * THE-314's legal footprint is the privacy paragraph above. `blog/*`,
   * `refunds`, `features/discipleship-content`, `features/platform-brand` and
   * `features/harvest-scheduler` are all untouched, which is what says the
   * social-media scheduler page was not confused with the service planner.
   */
  const THE_335_MOVED: Readonly<Record<string, string>> = {
    'contact/index.html':
      '035afb8f6c533cb8f650bd17d5ecd0bfd4f2a386b87bb239a20e356907c9c778',
    'faq/index.html':
      '0efc1c9e4380a201d104c038a4e2f30347fdbcd60f79ddf6d1bef432488d5109',
    'features/ai-automation/index.html':
      'bbc8a40447dfbed578996e0bcb94f23391f7952ec528c2eeb871bece5b133b1c',
    'features/coming-soon/index.html':
      '600c0217572d5356744f77ebaabbb18a535cb828c3b67e99f5ca60875bed03b8',
    'features/community-engagement/index.html':
      '43a10f253a350a19335b6b72e05e3c86e4ae24b235772df95d3c64770fce436d',
    'features/giving-finance/index.html':
      '92643e7ef6e46f371666b9a273eab07cb751f1afdde1612253786297751c01ce',
    'features/index.html':
      'a1c2e2b0591f8deaa69ea2d6a5866f41a6b1612460e2c016cb7a4863e7f3b98c',
    'index.html':
      '52096cd79e74081f66d8ea341dfea93dc86b1fd1e398d05ef73ccdfd1837de13',
    'pricing/index.html':
      '4f241a2724b31377d1ffafa10331e19cc9a707c9acf5596fdf07ce0f426c6c84',
    'privacy/index.html':
      'c85289d0c324e911ca2b6bb353cb01e7bf1ad51bf640f7f44dd689afbf0f7829',
  };

  /**
   * 🔴 THE-343 — THE MINISTRY REPRICE. Five pages, and every one of them moved
   * for the SAME reason: Ministry costs $60/$162/$564 where it cost
   * $80/$216/$760, and its per-month annual equivalent is $47 where it was
   * $63.34. Named rather than counted, because "five pages moved" is a number
   * and "these five render a Ministry price" is a claim:
   *
   *   pricing        the three cards and the comparison table
   *   index          the #replaces band, which quotes the Ministry annual
   *                  monthly-equivalent, and the pricing section it shares
   *   terms          TIER_PRICE_CLAIMS, quoted in writing in §Fees
   *   faq            FAQ_PLAN_CLAIMS, in the prose AND in the FAQPage JSON-LD
   *   blog/planning-center-alternative-small-churches
   *                  the comparison table's two Harvest rows and the
   *                  "$47.00/month billed annually" sentence
   *
   * ⚠️ ALSO ON `pricing` AND `index`: Ministry's new EARLY BIRD eyebrow, and
   * the RECOMMENDED / FOR EVANGELISTS pills moving to one shared `CardEyebrow`.
   * The filled pill's BORDER-BOX IS UNCHANGED by that move — 4px/10px with no
   * border became 3px/9px plus a 1px transparent border — so the only visible
   * addition is the second pill on the Ministry card.
   *
   * 🔴 SEVENTEEN OF THE TWENTY-TWO ARE BYTE-IDENTICAL, which is the real
   * assertion: `refunds`, `contact`, `privacy`, every `features/*` page, the
   * blog index, the three category pages and the other two posts render no plan
   * price, and a reprice that reached any of them would be a price leaking onto
   * a surface nobody chose.
   */
  const THE_343_MOVED: Readonly<Record<string, string>> = {
    'blog/planning-center-alternative-small-churches/index.html':
      'b19a1596027d1435225d3c1963f8d469786db5a61a4cadea7142ddac3423f012',
    'faq/index.html':
      '5e29823e161afad5c21720238def63c2836ef968514cc69744b2d1aebca31d58',
    'index.html':
      'c5c7d77bb13577523cc1f457bc290aed30ce93ee67d9ca9bcc2c8d23d9bd4061',
    'pricing/index.html':
      'ecd42363c6afbba78e49c3b0411a1e255ae896dc7053c5ad2b925420651103eb',
    'terms/index.html':
      'afc4c5cf3d5a998a8273df274961eb4a4e265033bb0b64effed973a84af8028e',
  };

  /**
   * 🔴 af7a7ba — NOT A TICKET, AND NOT THIS ONE. A DIRECT PUSH TO `main`.
   *
   * The `inside-harvest` post "What your year-end giving statements must
   * include" was pushed straight to `main` on 2026-09-10. CI runs on
   * `pull_request` only and `main` is unprotected, so nothing in this suite ever
   * ran against it — and every pull request opened since has been red on the
   * three assertions below plus the five `blogRoutes()` counts. THE-355 found
   * them red and rebaselined them; it did not cause them.
   *
   * ⚠️ RECORDED SEPARATELY, AND CREDITED, rather than folded into THE-355's own
   * table. Two changes in one table is exactly how a page moves for a reason
   * nobody wrote down — which is the failure every named table in this file
   * exists to prevent. The values here are from a build of PRISTINE `main` at
   * af7a7ba, in a worktree, so they are the post's own figures and carry none of
   * THE-355's edits.
   *
   *   · blog/index               the post joins the index listing.
   *   · blog/category/inside-harvest
   *                              and its category page.
   *   · blog/year-end-giving-statements-what-to-include
   *                              ADDED — the 23rd route, which is what takes
   *                              `blogRoutes()` from 22 to 23.
   *
   * 🔴 AND THE OTHER TWENTY DID NOT MOVE, which is what says a blog post is a
   * blog post: `posts.ts` is read by the index and the one category page it is
   * filed under, and by nothing else on the site.
   */
  const AF7A7BA_MOVED: Readonly<Record<string, string>> = {
    'blog/category/inside-harvest/index.html':
      '473452a9976e38921558be3def7300dc4b0aceca63b21df69cd2d4c43e7f07b7',
    'blog/index.html':
      '7b9b0048cb0675663054129d109e23cdb4f7770fb9c20502503ae9014812a37c',
  };
  const AF7A7BA_ADDED: Readonly<Record<string, string>> = {
    'blog/year-end-giving-statements-what-to-include/index.html':
      'c87fac62d96bbeaa2abee01e2be01cec9066f3b469eccc63634a1fad6bb25cf0',
  };

  /**
   * 🔴 THE-355 — THE NINE PAGES THAT MOVED, and every one explained by a
   * change this ticket made. `STRIPE_GIVING_MARKETING_ENABLED` is false, and
   * Pledge Campaigns became a feature entry of its own:
   *
   *   · features/giving-finance  the largest change, and the one the ticket is
   *                              for: the Donation Page entry reworded off
   *                              Stripe (eyebrow, title, one-liner, moment and
   *                              every bullet) and its vignette redrawn as the
   *                              church's own accounts; Fundraising renamed to
   *                              Fundraising Campaigns and its automatic-credit
   *                              bullet replaced; a NEW `pledges` section
   *                              directly after it, with its own icon and
   *                              vignette; the CRM's two give-half claims; the
   *                              category intro and the SEO line.
   *   · features/community-engagement
   *                              the Event Registration entry off destination
   *                              charges and off discount codes, and the
   *                              livestream's "give in one tap".
   *   · faq                      the giving answer's second and third
   *                              paragraphs, which described a rail that
   *                              answers 503.
   *   · features/coming-soon     the Affiliate referrals entry's `notThis`,
   *                              which named the church's Stripe account as
   *                              something that "ships today".
   *   · features                 the category index renders each category's
   *                              `seo` line, and giving-finance's changed; it
   *                              also carries the footnote whose digit is
   *                              CATALOG_TOOL_COUNT, 26 → 27.
   *   · index (home)             the same footnote digit, and the #replaces
   *                              Giving & Finance row, which gains Pledge
   *                              Campaigns and reads the renamed Fundraising
   *                              Campaigns caption off the catalogue.
   *   · pricing                  the same footnote digit.
   *   · features/platform-brand  🔴 THE ONE ENTRY THAT IS NOT BEHIND THE FLAG.
   *                              The Admin Dashboard entry's member bullet read
   *                              "A first-run wizard for Stripe, branding &
   *                              integrations"; `components/PostPurchaseWizard
   *                              .tsx` has four steps — Connect Instagram,
   *                              Connect Mailchimp, Custom Domain and Brand Your
   *                              App — and no payment step in any plan's
   *                              sequence. That was true before the platform
   *                              account closed and will be true after it
   *                              reopens, so the word was dropped outright
   *                              rather than gated: putting it behind the switch
   *                              would schedule a false claim to come back.
   *   · blog/year-end-giving-statements-what-to-include
   *                              🔴 THE ONE SURFACE A FLAG CANNOT REACH.
   *                              Markdown reads no flag, so the sentence that
   *                              said a gift through the donation page writes a
   *                              receipt, a CRM record and campaign credit is
   *                              REWRITTEN rather than gated — grounded in
   *                              `lib/manual-donation.ts`, which is what makes
   *                              a recorded gift reach a giving statement. It
   *                              is the only change in this ticket that has to
   *                              be undone by hand if the flag is flipped back,
   *                              and the pull request says so.
   *
   * 🔴 AND THE FOURTEEN THAT DID NOT MOVE ARE THE EVIDENCE. `terms`, `privacy`
   * and `refunds` are the three worth naming: they carry the same Stripe
   * Connect statements and `src/content/legal.ts` is deliberately untouched —
   * withdrawing a term from a published agreement is a founder decision, and
   * the affected lines are enumerated in the pull request instead.
   * `features/ai-automation`, `features/discipleship-content`,
   * `features/harvest-scheduler` and `contact` are the leak test:
   * `FeatureMock.tsx`, `FeatureBlock` and `catalog.ts` are all rendered by those
   * pages, and an edit that reached past the giving keys would show up here as
   * more entries. ⚠️ `features/platform-brand` LEFT that list and is above,
   * for the wizard bullet — one line, on one entry, and it is named rather than
   * absorbed for exactly that reason.
   *
   * Regenerated from a fresh `npm run build` on Linux, the same procedure the
   * note on THE_301_MOVED describes.
   */
  const THE_355_MOVED: Readonly<Record<string, string>> = {
    'blog/year-end-giving-statements-what-to-include/index.html':
      'ee6ec8d08d474dd4596a03ce865eb8cacd6be386574371b0ed64af6e4c53e54b',
    'faq/index.html':
      '2cef2ba401e53cc292e9c7e85b532b567d83f0259a708139e3c695f461cd4653',
    'features/coming-soon/index.html':
      'ba4694b55f911b76ebfdb5cb42bd399458632e7ed6faeff976b1396b22e02cce',
    'features/community-engagement/index.html':
      'b1cb7266978640d7dc7bdf2ec8625efb4a51f1fb961840d5e7866fd14c3c61a1',
    'features/giving-finance/index.html':
      '21efe6e2db31507f9efdd899925131819164c72a20b669f6ee030d5f2de17d21',
    'features/index.html':
      '03d73eacf044784b9b6c816e1a1522792f6802f954a14a496a86907dba7ab29b',
    'features/platform-brand/index.html':
      'e7bdc09f17b8af0bf55c496171b0a21764128545bcabd1ba7e9219dd1970b296',
    'index.html':
      '0c87386e96ea71ddae144bb93ae36394ab957815cbe0e620069a524d48966b8b',
    'pricing/index.html':
      'c83aa0e0f4090a234b9a3b7e54cd9ef6d1f10e6fe8041ec246141772264569c7',
  };

  /**
   * 🔴 SOLUTIONS / EVANGELISTIC ORGANIZATIONS (board card 86bbyv8pp) — EVERY
   * PAGE MOVED, AND ONE PAGE WAS ADDED. Unlike every table above, this is not a
   * scoped content edit: `Nav.tsx` gained a "Solutions" trigger, desktop panel
   * and mobile accordion, and `Nav` renders on every route through `Layout` in
   * App.tsx. So every one of the 23 pages this file already fingerprints moved
   * by exactly that much — a new button, its chevron and (when open) a panel —
   * and NOTHING ELSE about any of them changed.
   *
   * ⚠️ RECORDED AS ONE TABLE RATHER THAN TWENTY-THREE OVERRIDES SCATTERED
   * THROUGH THE FILE ABOVE, because the previous tables each name a handful of
   * pages a SPECIFIC change reached; a change that reaches literally everything
   * is better read as its own list than smeared across every one of them. The
   * per-ticket "and the others did not move" tests below are updated to exclude
   * this table from their own exclusion sets for the same reason — they still
   * assert their own ticket's pages did not move for a NAV reason, just no
   * longer expect the older, pre-Solutions value.
   *
   * The 24th entry, `solutions/evangelistic-organizations/index.html`, is the
   * new page itself, fingerprinted from its first build like every other page
   * THE-284 and THE-355 added before it.
   *
   * Regenerated from a fresh `npm run build` on Linux, the same procedure the
   * note on THE_301_MOVED describes.
   */
  const SOLUTIONS_EVANGELISTIC_MOVED: Readonly<Record<string, string>> = {
    'blog/category/harvest-vs/index.html':
      'a46ec4540cb9e0daa17865be9c78adb01f5d54475cf3fde58402363c713db93c',
    'blog/category/inside-harvest/index.html':
      'e9ef1c821851d41d9827bad261f9b4a5ca95eeaa3abc0a05b85397ce3118b009',
    'blog/category/rooted/index.html':
      '44ed731610716bab3d14a736f4210d3321fc8badeb858a9686fa738252537808',
    'blog/generosity-without-pressure/index.html':
      '35f09074dc61b05d38c605b23a6513db469d9aa9042095ebe4856eb758eadef1',
    'blog/index.html':
      '50cbcf0c98562147fddd31ee0bbe0112234b7234264f110b0e5f8cc28bb83b07',
    'blog/planning-center-alternative-small-churches/index.html':
      'c6b5cb3449f9afa0959c55c3e9f514d405d32d1accb8e5264e012bba6645d0d3',
    'blog/work-that-outlives-you/index.html':
      '122951829f23a381c9fa77ad72c76f4adf2110fe806c2b5cf6ab7be338644cea',
    'blog/year-end-giving-statements-what-to-include/index.html':
      'f30a59f166d5c4af291d2896471980da09dfbc50d0bbf99e8a24d232b4ddcd30',
    'contact/index.html':
      '27d1a1716aec8834ebb62eda6895da6f9023ab2c9e7e9b9a93e49b4b2b7bebbb',
    'faq/index.html':
      '802eda6f7ec9333fca2a1147f12f5520a92950769585c1f70f69c3a499ab5760',
    'features/ai-automation/index.html':
      '330a389ece2586af7008b25ce4315596b80e5fdd06b1c8649ad8b32f563ad5a1',
    'features/coming-soon/index.html':
      'ce1584b50f12116b74946ccb652fd842ecade392d33adf255cc9ec54d3dff502',
    'features/community-engagement/index.html':
      '21818e8e7422fba53aa9672c95a1ea9fc1445b38b09b9fae22e71d91efd6a6ce',
    'features/discipleship-content/index.html':
      '82d128cb8fc0fa4411f09effc2e70797ba660f472b18b90d9a5739801063a9ce',
    'features/giving-finance/index.html':
      'd5b662f9c3559ff2fc036ad183a6b386c81062661c0fb7d69380d32ee2ed7db4',
    'features/harvest-scheduler/index.html':
      'c8be23d0418ff7b07271e5a8f5b05f88379c4693b820ad6282a6b9f34351061a',
    'features/index.html':
      '5b53c8554284d30d2938aa262135c2c9faf7a34789b8c004673be35c1fa4c978',
    'features/platform-brand/index.html':
      '95af9c0d571b4e38cbb8e49e0151b8564be3102111d81dfd82ba8312e7acf303',
    'index.html':
      '600f973677c3017aef61019a408d957b51cd063b215412baaa412a944c16e7f0',
    'pricing/index.html':
      '446705653ec9023fd412372361d13509f766c32031b26ad56c03b5502bd66070',
    'privacy/index.html':
      '99228afe9cab9485f6e380b4e9d081cfe3c74fa6e7e1701426dd2710b2bf11d4',
    'refunds/index.html':
      'af2572200436e98c08afcfb458e9be834c4423421bacb87346d22de5d5891d1f',
    'terms/index.html':
      '3cfef7061e1daa7ef7b35f5284010f10cedeeb44d6deb89ab7b50c50db307b9c',
    // 🔴 ADDED — the new page, not a move.
    'solutions/evangelistic-organizations/index.html':
      '746e45caf64cfd38517d7000282ac0feef47e908ea25bf049c077c0854a5c9c2',
  };

  /**
   * 🔴 SOLUTIONS / CHURCHES (board card 86bbyv8pp, part two) — ONE PAGE MOVED,
   * AND ONE PAGE WAS ADDED — and the one that moved is NOT the Nav change.
   *
   * ⚠️ THE NAV TRIGGER'S PANEL IS NOT IN THE PRERENDERED MARKUP, so adding a
   * second `SOLUTIONS` entry moved NOTHING the way the first one did.
   * `Nav.tsx`'s desktop panel and mobile accordion are both gated behind
   * `{solutions && (...)}` / `{mobileSolutions && (...)}`, and the prerender
   * never sets that state — see the "the panel is not in the default-collapsed
   * prerendered markup" test in SolutionPage.test.ts, and the identical
   * property THE-284's note above already relies on for the mega-menu. So
   * every one of the 24 pages that existed before this ticket was hashed
   * before and after with the Nav change alone applied, and 23 of them came
   * back byte-identical.
   *
   * ⚠️ THE ONE THAT MOVED, moved for a DIFFERENT reason: adding the `services`
   * key to `MOCKS` in components/FeatureMock.tsx — the vignette this ticket's
   * own spec asked for, on the Churches page's Services tab — also fills in
   * the Service Planning FeatureBlock's vignette on the live
   * `/features/community-engagement` page, which was rendering an empty panel
   * for it before (no MOCKS['services'] entry existed anywhere on the site).
   * `FeatureMock.tsx` is shared chrome, so a key added to it changes every
   * page that already renders a FeatureBlock for that feature id, and
   * community-engagement is the only one that does for `services`.
   *
   * The second entry, `solutions/churches/index.html`, is the new page itself,
   * fingerprinted from its first build like every other page THE-284,
   * THE-355 and SOLUTIONS_EVANGELISTIC_MOVED added before it — recorded in its
   * own ADDED table rather than folded into MOVED, the same split THE-284
   * uses for THE_284_MOVED / THE_284_ADDED.
   *
   * Regenerated from a fresh `npm run build` on Linux, the same procedure the
   * note on THE_301_MOVED describes.
   */
  const SOLUTIONS_CHURCHES_MOVED: Readonly<Record<string, string>> = {
    'features/community-engagement/index.html':
      '6efe150f9fe7c737753493aa4989f64da40a5466eb0e220957be049ef18b2256',
  };
  const SOLUTIONS_CHURCHES_ADDED: Readonly<Record<string, string>> = {
    'solutions/churches/index.html':
      '580aaa749e2e1f66a35330fca75534785048eef34dea69b7b29b3065a8f9703d',
  };

  /**
   * 🔴 SOLUTIONS / INDIVIDUAL MISSIONARIES (board card 86bbz2yj6, the same
   * series' third and final page) — NO EXISTING PAGE MOVED, AND ONE PAGE WAS
   * ADDED.
   *
   * Unlike the first Solutions page, adding a THIRD `SOLUTIONS` entry moves
   * nothing else: `Nav.tsx`'s desktop panel and mobile accordion are still
   * gated behind `{solutions && (...)}` / `{mobileSolutions && (...)}`, which
   * the prerender never sets — the property SOLUTIONS_CHURCHES_MOVED's own
   * note already relies on for the second page.
   *
   * ⚠️ AND UNLIKE THE CHURCHES PAGE, NOTHING IN `FeatureMock.tsx` HAD TO
   * CHANGE. Every one of this page's eight tab ids and every deep-dive
   * feature id — `donation`, `sharegiving`, `fundraising`, `pledges`, `feed`,
   * `blog`, `crm`, `prayer` — already had a `MOCKS` entry before this ticket,
   * each already drawn by an existing live category page. So there is no
   * shared-component edit for a leak to ride in on, and this table is empty:
   * every one of the 25 pages that existed before this ticket, freshly
   * rebuilt, hashes identical to its SOLUTIONS_CHURCHES_MOVED/ADDED value —
   * `features/community-engagement` included, the one page a Missionaries-
   * page leak through `FeatureMock.tsx` would have reached first, since it
   * already renders `FeatureBlock`s for `feed` and `prayer`.
   *
   * The one entry, `solutions/missionaries/index.html`, is the new page
   * itself, fingerprinted from its first build like every other page THE-284,
   * THE-355, SOLUTIONS_EVANGELISTIC_MOVED and SOLUTIONS_CHURCHES_ADDED added
   * before it.
   *
   * Regenerated from a fresh `npm run build` on Linux, the same procedure the
   * note on THE_301_MOVED describes.
   */
  const SOLUTIONS_MISSIONARIES_MOVED: Readonly<Record<string, string>> = {};
  const SOLUTIONS_MISSIONARIES_ADDED: Readonly<Record<string, string>> = {
    'solutions/missionaries/index.html':
      '492cacb37f0182e220b50163c49cdcda0fec3e8be4126286793f644ad452f6f4',
  };

  /**
   * 🔴 SOLUTIONS TABS CENTERED — exactly the three Solutions pages moved, and
   * nothing else did.
   *
   * `OneAppTabs`'s `role="tablist"` flex row in SolutionPage.tsx had no
   * `justifyContent`, so it defaulted to flex-start and the tab pills sat
   * left-aligned under a centered heading. Adding `justifyContent: 'center'`
   * to that row (and dropping the now-redundant `textAlign: 'left'` on its
   * wrapper) is layout-only chrome inside `SolutionPage.tsx`, which only
   * `solutions/*` routes render, so `churches`, `evangelistic-organizations`
   * and `missionaries` are the only pages that could move — and did.
   *
   * Regenerated from a fresh `npm run build` on Linux, the same procedure the
   * note on THE_301_MOVED describes.
   */
  const SOLUTIONS_TABS_CENTERED_MOVED: Readonly<Record<string, string>> = {
    'solutions/churches/index.html':
      'ed2b8126ea61d0723e36fa8fc16f0d9777836438658a2d9e765f3a62a6a20d29',
    'solutions/evangelistic-organizations/index.html':
      '4b93b04c3718104db4345c9e4aa2e5b4872b5198de8f0aec334402220241e718',
    'solutions/missionaries/index.html':
      'afc0ffb156b11a460997e0e6348cb9622e977293502632adb63c520d9a65f8b7',
  };

  /**
   * 🔴 THE-358 — ALL TWENTY-SIX PAGES MOVED, AND THAT IS THE EXPECTED SHAPE.
   *
   * The precedent is SOLUTIONS_EVANGELISTIC_MOVED above, which records exactly
   * this and for exactly this reason: `Nav.tsx` renders on EVERY route, so a
   * change to the nav bar changes every prerendered page. THE-358 turned the
   * nav's flat "Resources" link into a dropdown over Documentation, Changelog
   * and the Blog, and added Documentation and Changelog to the footer's
   * RESOURCES column — and the footer renders on every route too. Two sitewide
   * components changed, so twenty-six of twenty-six is the honest count; a
   * SMALLER number here would be the surprise, since it would mean a page was
   * not rebuilt.
   *
   * ⚠️ THE PAGE COUNT IS UNCHANGED AT 26. This ticket adds and removes no
   * route: the documentation lives on docs.theharvest.site, a different site
   * entirely, so linking it adds no page here. `features/coming-soon` moved for
   * a second reason on top of the nav — the `docs` entry was removed from it
   * because the documentation shipped — and it is the only page with two
   * reasons. The assertion below that this table covers `pagesInDist()` is what
   * proves an added or dropped page would have been caught rather than absorbed.
   *
   * Taken from the same Linux `npm run build` as BASELINE_ALL below.
   */
  const THE_358_MOVED: Readonly<Record<string, string>> = {
    'blog/category/harvest-vs/index.html':
      '447cd45b3067593daf52490ca59444b4bbd689df18b89e71050d06699a6e177a',
    'blog/category/inside-harvest/index.html':
      'ae178d06d933b5ba02c17363b147c3f55b64d9bbb441226c5f82f52dd4fb1ba1',
    'blog/category/rooted/index.html':
      '9b13fa82b834500b3d2e871d2add9ed80de566d51804038c4b12cead4bf5ac8a',
    'blog/generosity-without-pressure/index.html':
      '54c7fee4a9f6e58e37bfde4f8f4c238aec1d108cbbc611ccb23ad5e0c2cfb8f4',
    'blog/index.html':
      '0eafb612f346467f2fa77167ae0b630efdb85364724d5f88f4421fc89c0e08c4',
    'blog/planning-center-alternative-small-churches/index.html':
      '00e8898cd05f9fcc176ed081e0b775c208b0d5f5a4312464baadbb1f79cb5899',
    'blog/work-that-outlives-you/index.html':
      'ee30ad46d6d4c926cf9eade380755dff734faa12ed7ff950a990d43aac69d912',
    'blog/year-end-giving-statements-what-to-include/index.html':
      'cecb2ea9f50dddbb4629573fe1b34002af0bbbd70e2430df1b0e9dfac7f06c3a',
    'contact/index.html':
      'e2105403dbbeb75066e59dc9aa0a286e3f3d5e18916c6b4779e62dfd62122fee',
    'faq/index.html':
      'b0f1977c3bdb8d150d87fad2744c679bbd3fa2b002dad4103ad95e1df0db5fd8',
    'features/ai-automation/index.html':
      'b1e5f425e0b1592a914e5f0e5e6ec6298eb1b11b3eb4ce7bd5508065fa3ee074',
    'features/coming-soon/index.html':
      'bf86a211ba4023f1260a8cf66524a88d0f77d106738ad20d6437ef978669ce61',
    'features/community-engagement/index.html':
      '0a296506ded5eddaf23e0cfd085a402efe5c839543cfeb2bfdf2bbb4a04a7995',
    'features/discipleship-content/index.html':
      '766a4e93ec93315bd01095192b3c6987532d568d13dc1aed6e915f656f399091',
    'features/giving-finance/index.html':
      'c43a981b036a839620e8b5aaa8a1c1172faba6241c5c8e2dd17659488edb3438',
    'features/harvest-scheduler/index.html':
      '8e9a9028a14861363e657608f2967d228c7ccc3bab720a97dd0b7d7ffd469bb9',
    'features/index.html':
      '406fe3aef1c78b62ded6c8f5c971a9e1162f4837642b2fb4978dfa4bd97cc595',
    'features/platform-brand/index.html':
      '4a4e67d568ddb8abdbefa25bfd7cc455bedd6900fc52000f950d6de1ec307850',
    'index.html':
      '535a2b84dbc4227dac87cafcc3b8cf6083f5b3d020e0ab1043f8e5719c60d40e',
    'pricing/index.html':
      'fb01fc56599d637b596c11034a45acf0ceb12b5151c78134d951400c7ae9d0c9',
    'privacy/index.html':
      '1b8444c0bc544c6f45101f73b4c798f303d06075bce5e49b11eda8887f35ce9a',
    'refunds/index.html':
      'a549e8b770ba5486c25b6dda95ba7266743bcd55c886fe0c998bef8db4ade4c4',
    'solutions/churches/index.html':
      '8b9a862a241659cb49206e446d34dd10c73e3e01404218e98f68443355a05050',
    'solutions/evangelistic-organizations/index.html':
      '05a8f8996d9407032134011ec8b9c40d76fed5665ddb2cf4563555cfb7fda226',
    'solutions/missionaries/index.html':
      '084fc9a3f3f1edce426b64d8f9fdde16a40d59c5d99bf396390b9206bfc42bef',
    'terms/index.html':
      '18a051e09647bd57630daffd4104e2153e5e3dd41b017e52ef57cc62b4541e8e',
  };

  /**
   * 🔵 525f630 — THE SECOND BLOG POST PUSHED STRAIGHT TO `main`, and the exact
   * shape AF7A7BA_MOVED / AF7A7BA_ADDED already record for the first.
   *
   * ⚠️ THIS IS NOT THE-370's, and it is recorded here only because CI gates
   * both repos' pull requests on a green suite. The `skool-alternative-for-
   * churches` post (525f630, corrected in prose by 330a51d twenty minutes
   * later) added the 27th route. Neither commit was ever CI-tested: this
   * repo's workflow runs on `pull_request` only, and its own header says so —
   * "a direct push to it now gets no CI at all". This PR is the first pull
   * request since, so it is the first run to see the drift.
   *
   *   · blog/index                        the post joins the index listing.
   *   · blog/category/harvest-vs          and its category page.
   *   · blog/planning-center-alternative-small-churches
   *                                       the other harvest-vs post — the two
   *                                       link to each other through the
   *                                       category's own related list.
   *   · blog/skool-alternative-for-churches
   *                                       ADDED — the 27th route, which is what
   *                                       takes `blogRoutes()` from 26 to 27.
   *
   * 🔴 AND THE OTHER TWENTY-THREE DID NOT MOVE, which is what says a blog post
   * is a blog post — the same claim AF7A7BA_MOVED makes, and the reason these
   * are two named tables rather than a relaxed assertion.
   */
  const SKOOL_POST_MOVED: Readonly<Record<string, string>> = {
    'blog/category/harvest-vs/index.html':
      '98828c862d086b1ae2375dd654719a2082d9d7d8f6778eda4c7f7f091121501c',
    'blog/index.html':
      'ac6cac96ed205579d1d9e34500a966fca6d0f584bbea2204a6ee9e1f93a93348',
    'blog/planning-center-alternative-small-churches/index.html':
      '9a0dc022bc14ac55cc4cb2218c5f31971695614dcb0bef6114c4ead9fbf4d4c5',
  };
  const SKOOL_POST_ADDED: Readonly<Record<string, string>> = {
    'blog/skool-alternative-for-churches/index.html':
      '626ea5a3deaaaa80a5d2e3e58656e2eb62416517c8d0f8702cc3ada8844be11c',
  };

  /**
   * 🔴 THE-370 MOVED EIGHT PAGES, AND ADDED AND DROPPED NONE.
   *
   * The ticket raises every plan's contact cap (Individual 150 → 500, Small
   * Team 500 → 2,000, Ministry 2,000 → 4,000) and retires two add-ons, so the
   * pages that move are exactly the ones that PRINT a cap or an add-on card:
   *
   *   pricing            the three plan cards' contact bullets, and the add-on
   *                      section going from five cards to three with Unlimited
   *                      Contacts repriced $40/$480 → $30/$360.
   *   index              the same pricing section renders on the home page.
   *   faq                FAQ_PLAN_CLAIMS carries the per-plan contact figures.
   *   features/giving-finance        the CRM deep-dive's `tiersNote` and its
   *                      "Contacts scale by plan" line, both of which name the
   *                      caps.
   *   features/community-engagement  the campus-map admin line, which read
   *                      "One campus location on every plan".
   *   solutions/churches, solutions/evangelistic-organizations,
   *   solutions/missionaries         all three render the pricing section.
   *
   * 🔴 AND THE OTHER EIGHTEEN DID NOT MOVE, which is the claim worth having:
   * the blog, the category indexes, the legal pages, contact, the remaining
   * four feature pages and features/index are byte-identical, so the change is
   * confined to the surfaces that actually quote a number.
   */
  const THE_370_MOVED: Readonly<Record<string, string>> = {
    'faq/index.html':
      '557785cfa965c9ebc5b712935f870dadcd5bf0194e413afc23b8758a4e973d92',
    'features/community-engagement/index.html':
      'a0dedd25a7487a8db458795d649d80c6078b995f062d1f32252faac84700b4e1',
    'features/giving-finance/index.html':
      '8f7fb380a4fd834c0b2feaa26118c2c868e2ae8245f003ff11df7dde4eda00f9',
    'index.html':
      'e7528327bddf3fc87895a211f3d07456a7994b7129c7353c01c01d6f03f758b8',
    'pricing/index.html':
      '49dc8a795b74c284adffdb65f8d83e9c74d9688d32fe5420b1279f1e33245a81',
    'solutions/churches/index.html':
      'af4c1ebacaa13cebe526a58f2bd6b06e582ff1b82ae4817f04c92ce72adf5dce',
    'solutions/evangelistic-organizations/index.html':
      '1ff8b4c9f2521fa56664493107ccbba3ab4c631bbb661b90e84ad28fdb934556',
    'solutions/missionaries/index.html':
      '11d33877e3fe849fb798ae240570fab97f1532eea7f0abc3ac87c8cf9dafbea4',
  };

  /**
   * 🔴 HONEST-OFFER — SIX PAGES MOVED, ADDED AND DROPPED NONE.
   *
   * The live site was still selling SMS, newsletters and a custom domain while
   * `SMS_MARKETING_ENABLED`, `NEWSLETTER_MARKETING_ENABLED` and
   * `CUSTOM_DOMAIN_MARKETING_ENABLED` are all false. The six pages that PRINT
   * those claims are the ones that move:
   *
   *   index                      homepage meta description no longer lists SMS
   *   pricing                    Ministry card: "Custom Branding", not
   *                              "Custom Branding & Domain"
   *   faq                        Ministry plan answer drops "and domain"
   *   features/ai-automation     category intro/SEO no longer sell a newsletter
   *   features/coming-soon       SMS / scheduler copy no longer describes a
   *                              live Mailchimp newsletter
   *   features/index             the AI category card renders the same intro
   *
   * 🔴 AND THE OTHER TWENTY-ONE DID NOT MOVE, which is the claim worth having:
   * solutions pages, the blog, legal, contact, and the remaining four feature
   * pages are byte-identical. Prices are unchanged. Taken from the same Linux
   * `npm run build` as BASELINE_ALL below.
   */
  const THE_HONEST_OFFER_MOVED: Readonly<Record<string, string>> = {
    'faq/index.html':
      'fbb60eff988bde3adef2d8ba82ef895d05fa7fbd13537601d3bb958680ea88d9',
    'features/ai-automation/index.html':
      '5dd81f80917e919b6093af26cef2518b5abb53789692906a7f44fc92718c6fb7',
    'features/coming-soon/index.html':
      'c8ccdc6f8a69303f3326b0a906c7b4ea57149f671f9646e64a7c5262449f4c66',
    'features/index.html':
      '727859e4df3bab7d37812c03c548c278b708cea27f1ebf4aa411fab00f1eed21',
    'index.html':
      '77c716993ace537f5601bcb2a178536b27a560640ac419fbb28d22b113fe3fe8',
    'pricing/index.html':
      'bf19cd29c9c0d7a0d4fa8c7d8989698442e00a0b0770ec441345d901dd56b107',
  };

  /**
   * 🔴 MAIN_105_106 — NINE PAGES MOVED AND ONE ADDED, BY TWO PRs MERGED RED.
   *
   * #105 (SEO vocabulary inserts: FAQ, the three Solutions pages, the giving
   * and community-engagement feature pages, the homepage, the Planning Center
   * post) and #106 (the homepage lead-capture band and the new /waitlist
   * page) were both merged with this workflow failing, so none of these
   * fingerprints was retaken with them and every PR after them was red here.
   * Recorded as found, from a Linux `npm run build` of `main` at bc24341 with
   * no other change — NOT THE-372's; it is corrected in THE-372's PR only
   * because CI gates that PR on it, and in a commit of its own.
   *
   *   index, pricing, faq       #105's copy inserts (and #106's homepage band)
   *   features/giving-finance,
   *   features/community-engagement, solutions/{churches, evangelistic-
   *   organizations, missionaries}, blog/planning-center-alternative-small-
   *   churches                  #105's copy inserts
   *   waitlist                  ADDED by #106 — the 28th route
   */
  const MAIN_105_106_MOVED: Readonly<Record<string, string>> = {
    'blog/planning-center-alternative-small-churches/index.html':
      'b6e3b0fd4aef16ba1491f5c24fdbab41c6a5657d8ac5664a849873251105a33e',
    'faq/index.html':
      '4d43be215c2561fc3db0c2844ab83f5f9dbcea3023e806bff31873117e469638',
    'features/community-engagement/index.html':
      '25e1fb3193311286887737d91a46028629b7fd0f7ead3013ab91307b22b4f4c6',
    'features/giving-finance/index.html':
      '060cc866bc1e2baaf0d200d87eb8d3a8b7a9e9dc21ee5235f66c6b087b364169',
    'index.html':
      '95681aed638a9d58af99188bab0c5f78ae2b0d51cc8329948fa217a1d1d49a73',
    'pricing/index.html':
      '06832c93b19f3c04833cafcdabea73589621fc4a6a15ee691d35506f82c02a84',
    'solutions/churches/index.html':
      'e31553f2d19b0e7bcd6894813814cb1dfe8cb15628fc1bfc6a21a187f264913a',
    'solutions/evangelistic-organizations/index.html':
      'e0b03428ee0d3a3a31a27f823a44cc75b3c52accaa1bc778fe804ee615796859',
    'solutions/missionaries/index.html':
      'e9bb711d1bd0b334c58dde355f4cb2cee035a944191563ec37a413b936551042',
  };
  const WAITLIST_106_ADDED: Readonly<Record<string, string>> = {
    'waitlist/index.html':
      '32db69cc078c864e84e928e15fd2c18684bf3798f5e94719af0138d426ea29ed',
  };

  /**
   * 🔴 THE-372 — MINISTRY BACK TO $80, AND THE OFFER LABEL GOES. Seven pages,
   * every one of them because it prints a Ministry price or the card:
   *
   *   pricing, index   the Ministry card ($80 / $216 / $752, $72 and $62.67
   *                    headlines), THE-343's offer pill REMOVED, and on index
   *                    the #replaces bottom line ($62.67/mo billed annually)
   *   terms            TIER_PRICE_CLAIMS, quoted in §Fees
   *   faq              FAQ_PLAN_CLAIMS, in the prose and the FAQPage JSON-LD
   *   blog/planning-center-alternative-small-churches,
   *   blog/skool-alternative-for-churches,
   *   blog/year-end-giving-statements-what-to-include
   *                    each quotes Ministry's monthly or yearly figure
   *
   * 🔴 THE OTHER TWENTY-ONE ARE BYTE-IDENTICAL — no feature, solutions or
   * category page renders a plan price, and a reprice that reached one would
   * be a price leaking onto a surface nobody chose. No route added or dropped.
   * Taken from a Linux `npm run build` of this branch.
   */
  const THE_372_MOVED: Readonly<Record<string, string>> = {
    'blog/planning-center-alternative-small-churches/index.html':
      'e1c0b29843175666c805ed0b9e8ba9875fbb0af4f0cc7f27a8fee3a4a23eecb4',
    'blog/skool-alternative-for-churches/index.html':
      '8a259de8df526448a06b0ce0c40a68d02aaa9737386e35a246cbe8218a424e68',
    'blog/year-end-giving-statements-what-to-include/index.html':
      'af1d7b280832faac577a54c3aebc411c7710e546d147d44f4b2b02fbf53fdee0',
    'faq/index.html':
      '4cd185693d2f2a63e0d3d130b04db60e186fd6ae80f8a8337eda04179b55c9f5',
    'index.html':
      '8c1c8e128624c41843e052f3ee72d996b600f3a2cf3b18034ce70f7bbe1fdbb7',
    'pricing/index.html':
      '30807efd9a900c40f89004362a33b611bcfd3d061d6d5c0a5685316799af936f',
    'terms/index.html':
      '1010bbff4b67a89f5d716db5dc1c4ebdff01b80df0cfb58edaeec62db4c401b9',
  };

  const BASELINE: Readonly<Record<string, string>> = {
    ...PRE_TAILWIND, ...THE_280_MOVED, ...THE_284_MOVED, ...THE_284_ADDED, ...THE_293_MOVED,
    ...THE_301_MOVED, ...THE_306_MOVED, ...THE_314_MOVED, ...THE_335_MOVED,
    ...THE_343_MOVED, ...AF7A7BA_MOVED, ...AF7A7BA_ADDED, ...THE_355_MOVED,
    ...SOLUTIONS_EVANGELISTIC_MOVED, ...SOLUTIONS_CHURCHES_MOVED, ...SOLUTIONS_CHURCHES_ADDED,
    ...SOLUTIONS_MISSIONARIES_MOVED, ...SOLUTIONS_MISSIONARIES_ADDED,
    ...SOLUTIONS_TABS_CENTERED_MOVED, ...THE_358_MOVED,
    ...SKOOL_POST_MOVED, ...SKOOL_POST_ADDED, ...THE_370_MOVED,
    ...THE_HONEST_OFFER_MOVED,
    ...MAIN_105_106_MOVED, ...WAITLIST_106_ADDED,
    ...THE_372_MOVED,
  };

  /** The same 22 as one number, so an ADDED or DROPPED page is caught too.
   *
   *  ⚠️ THIS MOVES WHENEVER ANY PAGE MOVES — it is one hash over all 22, so it
   *  is not evidence about WHICH page changed and never was. The per-page
   *  tables above are what say that; this says only that the SET is what the
   *  tables claim. Retaken at THE-301 from the same build as the two entries
   *  above; the previous value was b7dc6e6766fbd218fe58a39197c87e71bb272e65410f1822c14b531f917a14d9.
   *
   *  Retaken again at THE-314 from the same build as THE_314_MOVED; the previous
   *  value was a68cec2fd49851b3a960679733f94bc1ef1944bbc19f5bb6c7f2bbebeb13793c.
   *  🔴 THE PAGE COUNT IS UNCHANGED AT 22 — THE-314 adds no route, and the
   *  assertion below that this hash covers `pagesInDist()` is what proves an
   *  added or dropped page would have been caught rather than absorbed.
   *
   *  Retaken again at THE-335 from the same build as THE_335_MOVED; the previous
   *  value was f4bead896c16822fac0b6d3a493a2ac98277c1358b80316e39f1cad3ed793692.
   *  🔴 THE PAGE COUNT IS STILL 22 — THE-335 adds and removes no route. */
  /*  Retaken again at THE-355 from the same build as THE_355_MOVED; the previous
   *  value was 7f97c8d6345bb20409439f54e26e9ec94c878316ad26f42886813e9126af5ff1.
   *  🔴 THE PAGE COUNT MOVED, 22 → 23, AND NOT BECAUSE OF THE-355 — the Sep 10
   *  `inside-harvest` post added the route (see AF7A7BA_ADDED above). THE-355
   *  adds a SECTION to a page that already renders, which is an anchor rather
   *  than a page. A one-number hash over the whole set cannot tell those two
   *  apart, which is exactly why the tables above are separate and named. */
  /*  Retaken again at SOLUTIONS_EVANGELISTIC_MOVED from the same build as that
   *  table; the previous value was
   *  3e2b31da58260d961ee0d24090af165599e3ba4f28b254b1b46ccaf38f0c0859.
   *  🔴 THE PAGE COUNT MOVED, 23 → 24 — the new /solutions/evangelistic-
   *  organizations page — AND EVERY ONE OF THE OTHER 23 MOVED TOO, because
   *  `Nav.tsx`'s new Solutions trigger renders on every route. */
  /*  Retaken again at SOLUTIONS_CHURCHES_MOVED / SOLUTIONS_CHURCHES_ADDED from
   *  the same build as those tables; the previous value was
   *  20ff432681b06c44a4b9f166bb18812377cac137430979b2dbc3bbc14e880db1.
   *  🔴 THE PAGE COUNT MOVED, 24 → 25 — the new /solutions/churches page —
   *  and, unlike the first Solutions page, ONLY ONE OF THE OTHER 24 MOVED:
   *  `features/community-engagement`, for the `services` MOCKS entry reason
   *  documented on SOLUTIONS_CHURCHES_MOVED above, not the Nav trigger. */
  /*  Retaken again at SOLUTIONS_MISSIONARIES_MOVED / SOLUTIONS_MISSIONARIES_ADDED
   *  from the same build as those tables; the previous value was
   *  c98767cabfbfb7127701d9919e61c68534ebdd35570b611b749c48d87bccdcef.
   *  🔴 THE PAGE COUNT MOVED, 25 → 26 — the new /solutions/missionaries page —
   *  AND NONE OF THE OTHER 25 MOVED, since every tab and deep-dive feature id
   *  this page references already had a `FeatureMock` entry. */
  /*  Retaken again at SOLUTIONS_TABS_CENTERED_MOVED from the same build as that
   *  table; the previous value was
   *  b5607e4da0bbc59a0f31f34ce381846c8af087e13329d48e57709e675b560191.
   *  🔴 THE PAGE COUNT IS STILL 26 — no route was added or removed, only the
   *  three Solutions pages' own markup moved, as SOLUTIONS_TABS_CENTERED_MOVED
   *  documents. */
  /*  Retaken again at THE-358 from the same build as THE_358_MOVED; the previous
   *  value was
   *  2dc7f711a7a6f3c1ba22eb21553938bb446d4bc8a6e7e544d16515af6275418b.
   *  🔴 THE PAGE COUNT IS STILL 26 — THE-358 adds and removes no route; the
   *  documentation it links lives on a different site. Every one of the 26
   *  moved, because the nav AND the footer both changed and both render on
   *  every route — the SOLUTIONS_EVANGELISTIC_MOVED shape, for the same
   *  reason. */
  /*  Retaken again at THE-370 from the same build as THE_370_MOVED and
   *  SKOOL_POST_MOVED / SKOOL_POST_ADDED; the previous value was
   *  eb3254ae3dd8a1a881f65034052496c22ef86eacf893964fd336c54e53d1ee91.
   *  🔴 THE PAGE COUNT MOVED, 26 → 27, AND NOT BECAUSE OF THE-370 — 525f630's
   *  `skool-alternative-for-churches` post added the route (see
   *  SKOOL_POST_ADDED above), pushed straight to `main` and never CI-tested,
   *  exactly as the Sep 10 post in AF7A7BA_ADDED was. THE-370 itself moved
   *  eight pages and added none: the three plan cards' contact bullets and the
   *  add-on section, wherever they render. A one-number hash over the whole set
   *  cannot tell a new route from an edited page, which is exactly why the
   *  tables above are separate and named. */
  /*  Retaken again at THE_HONEST_OFFER_MOVED from the same Linux build as that
   *  table; the previous value was
   *  fa57650d6da8e1c3c553e71751bd199fb80fd60497f1bbf42d667ed863651169.
   *  🔴 THE PAGE COUNT IS STILL 27 — this change adds and removes no route.
   *  Six pages moved (the ones that still sold SMS, a newsletter or a custom
   *  domain while those flags are off) and the other twenty-one did not. */
  const BASELINE_ALL = 'ac7e508c55d98f9eb876d302bf4f31b3a4e4b05c66c76fba1ac557d46372dd0e';
  /*  🔵 FROM HERE ON THE WHOLE-SET HASH IS APPENDED, NEVER SUBSTITUTED. Each
   *  entry names the change that moved the set; the build must match the LAST.
   *  `BASELINE_ALL` above stays exactly as it was and is the first entry. */
  const BASELINE_ALL_PINS: readonly string[] = [
    BASELINE_ALL,
    // MAIN_105_106 — nine pages moved and /waitlist added (28 pages), as
    // found on `main` at bc24341. See MAIN_105_106_MOVED.
    '64fcd176627836b6db07c230e56642dcdc22e6ad4be8385fc9ffda764ee144a7',
    // THE-372 — seven pages moved (THE_372_MOVED), none added or dropped.
    '97cf6c8132878950236cb9cf0fb2c738810d398ae3066d818e42d238ce46cb68',
  ];

  it('🔴 THE-280 moved exactly six pages, and the other fifteen did not move', () => {
    /* The delta, asserted as a delta. Without this, a future ticket could add a
       seventh override and the suite would still pass — the whole point of
       recording the move separately is that the SIZE of it is checked too.

       ⚠️ "The other fifteen" are measured against THE TABLE ABOVE, not against
       the literal pre-Tailwind build, and the distinction now matters: THE-281
       legitimately retook `features/giving-finance/index.html` in that table when
       it added the Shareable Giving Page section. That page is not THE-280's and
       is expected to sit at THE-281's value — which is exactly what this checks,
       since it is in `untouched` and must equal the table. */
    expect(Object.keys(THE_280_MOVED).sort()).toEqual([
      'faq/index.html', 'features/coming-soon/index.html',
      'features/platform-brand/index.html', 'index.html',
      'pricing/index.html', 'terms/index.html',
    ]);
    for (const page of Object.keys(THE_280_MOVED)) {
      expect(PRE_TAILWIND[page], `${page} is not a page THE-278 fingerprinted`).toBeDefined();
      expect(THE_280_MOVED[page], `${page} is listed as moved but did not move`)
        .not.toBe(PRE_TAILWIND[page]);
    }
    /* ⚠️ THE_301_MOVED JOINS THE EXCLUSION LIST, and "fifteen" becomes
       thirteen. Nothing is dropped from the assertion by that: `contact` and
       `features` are still checked byte for byte, against THE_301_MOVED, in
       THE-301's own delta test below — the same way `features/coming-soon` left
       this loop when THE-284 legitimately moved it. What this loop measures is
       and always was "pages no LATER ticket has claimed are still at THE-278's
       value", and it still measures exactly that.
       ⚠️ AND THE_306_MOVED JOINS IT TOO, on identical terms: the giving page,
       the landing page and pricing are asserted against THE_306_MOVED in
       THE-306's own delta test below. Thirteen becomes twelve — only the giving
       page is new to this exclusion list, since `index` and `pricing` were
       already THE-280's. */
    /* ⚠️ AND THE_314_MOVED JOINS THE SAME LIST, on identical terms: its eight
       pages are asserted against THE_314_MOVED in the per-page comparison, not
       dropped from view. Twelve becomes ten: six of the eight were already
       excluded as THE-301's, THE-306's or THE-280's own.
       ⚠️ AND THE_335_MOVED JOINS IT ON THE SAME TERMS AGAIN. Ten becomes nine:
       nine of its ten pages were already excluded by one of the tables above,
       and the tenth is `faq`, which no earlier ticket had moved.
       ⚠️ AND THE_343_MOVED JOINS IT ON IDENTICAL TERMS. Nine becomes EIGHT:
       four of its five pages — `index`, `pricing`, `faq` and `terms` — were
       already excluded by a table above, and the fifth is the Planning Center
       blog post, which no earlier ticket had moved. It is still asserted byte
       for byte against THE_343_MOVED by the per-page loop below; nothing leaves
       the assertion, only this "still at THE-278's original value" subset. */
    /* ⚠️ AND TWO MORE JOIN IT, ON IDENTICAL TERMS AND FOR TWO DIFFERENT REASONS.
       AF7A7BA_MOVED / AF7A7BA_ADDED are the Sep 10 blog post, pushed straight to
       `main`; THE_355_MOVED is the Stripe-giving reword and the pledge split.
       Both are named tables above and both are still asserted page by page — a
       page leaving this subset means a LATER ticket has claimed it, never that
       it stopped being checked. */
    const untouched = Object.keys(PRE_TAILWIND)
      .filter((p) => !(p in THE_280_MOVED) && !(p in THE_284_MOVED) && !(p in THE_301_MOVED)
        && !(p in THE_306_MOVED) && !(p in THE_314_MOVED) && !(p in THE_335_MOVED)
        && !(p in THE_343_MOVED) && !(p in AF7A7BA_MOVED) && !(p in THE_355_MOVED)
        && !(p in SOLUTIONS_EVANGELISTIC_MOVED) && !(p in SOLUTIONS_CHURCHES_MOVED)
        && !(p in SOLUTIONS_CHURCHES_ADDED) && !(p in SOLUTIONS_MISSIONARIES_MOVED)
        && !(p in SOLUTIONS_MISSIONARIES_ADDED)
        && !(p in SKOOL_POST_MOVED) && !(p in SKOOL_POST_ADDED)
        && !(p in WAITLIST_106_ADDED));
    // 🔵 ZERO SINCE SOLUTIONS_EVANGELISTIC_MOVED: `Nav.tsx`'s new Solutions
    // trigger renders on every route, so every one of the six pages that were
    // still at their pre-existing value now has a SOLUTIONS_EVANGELISTIC_MOVED
    // entry too. The property this test exists to check — THE-280 moved
    // exactly these six and no others — is unaffected; there is simply no page
    // left for which "untouched" and "at THE-278's original value" are the
    // same claim.
    expect(untouched).toHaveLength(0);
    for (const page of untouched) {
      expect(BASELINE[page], `${page} drifted off the fingerprint the table records`)
        .toBe(PRE_TAILWIND[page]);
    }
    /* 🔴 And THE-281's page is still not THE-280's to have moved.
       ⚠️ IT LEFT `untouched` AT THE-306, which drew the Shareable Giving Page's
       vignette on it — so the check moves from "it is in the untouched list" to
       "the ticket that moved it was THE-306, and its value is THE-306's". The
       property is the same one: THE-280 did not touch this page, and if it ever
       did, its hash would have to appear in THE_280_MOVED and this would fail. */
    // 🔵 AND THE-314 MOVED IT AGAIN — the CRM feature's SMS crosslink resolves
    // once more, and the page carries the tool-count footnote.
    // 🔵 AND THE-335 MOVED IT ONCE MORE, rewording the accounting entry off
    // QuickBooks and dropping the CRM entry's SMS crosslink again. So the value
    // it is measured against is THE-335's now; the property is unchanged, and
    // it is still that THE-280 did not touch this page.
    const giving = 'features/giving-finance/index.html';
    expect(untouched).not.toContain(giving);
    expect(THE_280_MOVED[giving], 'THE-280 moved the Giving & Finance page, which is not its to move')
      .toBeUndefined();
    // 🔵 AND THE-355 MOVED IT AGAIN — the Stripe reword and the pledge split,
    // which is the largest single change this page has had. The value it is
    // measured against is THE-355's now; the property is unchanged.
    // 🔵 AND SOLUTIONS_EVANGELISTIC_MOVED MOVED IT ONCE MORE — the Nav change,
    // same as every other page. The value it is measured against is that
    // table's now; the property — THE-280 never touched this page — is
    // unchanged.
    /* 🔵 AND THE-358 MOVED IT AGAIN — the Resources dropdown in the nav and
       the two docs links in the footer, both of which render on every route.
       THE-358 is simply the most recent table that moved this page, so it
       goes at the FRONT of the chain; the property each assertion states —
       which pages ITS OWN ticket moved — is untouched.
       🔵 AND THE-370 MOVED IT ONCE MORE — the CRM deep-dive's `tiersNote` and
       its "Contacts scale by plan" line both name the per-tier contact caps,
       and this ticket raised all three. THE-370 is the most recent table to
       move this page, so it takes the front of the chain; THE-280 still never
       touched it, which is all this assertion has ever claimed.
       🔵 AND #105 MOVED IT AGAIN (MAIN_105_106_MOVED), so that table takes the
       front — THE-280 still never touched it. */
    expect(BASELINE[giving]).toBe(MAIN_105_106_MOVED[giving] ?? THE_370_MOVED[giving]);
  });

  it('🔴 THE-284 moved exactly one page and added exactly one', () => {
    /* The delta, asserted as a delta — the shape THE-280 established above, and
       for the same reason: without it a later ticket could add a second
       override and the suite would still pass, so the SIZE of the change is
       what is checked, not merely its content.

       ⚠️ THE MOVED PAGE IS THE ONE THE ENTRY RENDERS ON, and nothing else. If a
       second entry ever appears here, that is either a page this ticket had no
       business touching or a route inserted mid-table — see the note above. */
    expect(Object.keys(THE_284_MOVED)).toEqual(['features/coming-soon/index.html']);
    expect(Object.keys(THE_284_ADDED)).toEqual(['features/harvest-scheduler/index.html']);

    // The moved page really moved, and it moved off THE-280's value, not off
    // the pre-Tailwind one it had already left.
    expect(THE_284_MOVED['features/coming-soon/index.html'])
      .not.toBe(THE_280_MOVED['features/coming-soon/index.html']);
    // And the added page is genuinely new — no earlier table ever fingerprinted it.
    for (const page of Object.keys(THE_284_ADDED)) {
      expect(PRE_TAILWIND[page], `${page} is not a new page`).toBeUndefined();
      expect(THE_280_MOVED[page], `${page} is not a new page`).toBeUndefined();
    }

    /* 🔴 AND THE OTHER TWENTY ARE STILL AT THE VALUE THE TABLES ABOVE RECORD.
       Adding a coming-soon entry also adds a mega-menu item, which is chrome on
       every page — this is the assertion that says the menu is not in the
       prerendered markup and no other page came along for the ride. */
    /* ⚠️ AND THE_301_MOVED IS EXCLUDED HERE FOR THE SAME REASON as in THE-280's
       loop above — its two pages are asserted against THE_301_MOVED in THE-301's
       own delta test, not dropped. THE_306_MOVED's three are excluded on the
       same terms and asserted in THE-306's, so eighteen becomes fifteen. */
    const others = Object.keys(BASELINE)
      .filter((p) => !(p in THE_284_MOVED) && !(p in THE_284_ADDED) && !(p in THE_301_MOVED)
        && !(p in THE_306_MOVED) && !(p in THE_314_MOVED) && !(p in THE_335_MOVED)
        && !(p in THE_343_MOVED)
        && !(p in AF7A7BA_MOVED) && !(p in AF7A7BA_ADDED) && !(p in THE_355_MOVED)
        && !(p in SOLUTIONS_EVANGELISTIC_MOVED) && !(p in SOLUTIONS_CHURCHES_MOVED)
        && !(p in SOLUTIONS_CHURCHES_ADDED) && !(p in SOLUTIONS_MISSIONARIES_MOVED)
        && !(p in SOLUTIONS_MISSIONARIES_ADDED)
        && !(p in SKOOL_POST_MOVED) && !(p in SKOOL_POST_ADDED)
        && !(p in WAITLIST_106_ADDED));
    // 🔵 Fifteen until THE-314 took three more out of the list, on the same
    // terms: they are asserted against THE_314_MOVED, not dropped. Five of its
    // eight were already excluded as THE-301's or THE-306's.
    // 🔵 Nine since THE-343 excluded the Planning Center blog post, on the same
    // terms again — its other four pages were already excluded above.
    // 🔵 Six since af7a7ba and THE-355 between them excluded four more and
    // added one key — a net of three off this subset.
    // 🔵 ZERO SINCE SOLUTIONS_EVANGELISTIC_MOVED — every remaining page in this
    // set now has an entry there too, because Nav.tsx's Solutions trigger
    // renders on every route.
    expect(others).toHaveLength(0);
    for (const page of others) {
      expect(BASELINE[page], `${page} moved, and THE-284 had no business moving it`)
        .toBe(THE_280_MOVED[page] ?? PRE_TAILWIND[page]);
    }
  });

  it('🔴 THE-293 moved exactly one page, and added and dropped none', () => {
    /* The delta, asserted as a delta — the shape THE-280 and THE-284 both used,
       and the one that actually catches the failure this ticket was most likely
       to cause. Redesigning the scheduler page meant editing FeatureBlock, which
       every live category page renders; if that edit had changed any of them,
       this table would need five more entries and this assertion would say so. */
    expect(Object.keys(THE_293_MOVED)).toEqual(['features/harvest-scheduler/index.html']);

    // It moved off the value THE-284 pinned when it added the page, not off
    // some earlier one — this page has existed for exactly one prior ticket.
    expect(THE_293_MOVED['features/harvest-scheduler/index.html'])
      .not.toBe(THE_284_ADDED['features/harvest-scheduler/index.html']);

    /* 🔴 AND THE FIVE LIVE CATEGORY PAGES ARE STILL AT THEIR RECORDED VALUES.
       Named one by one rather than counted, because "the others did not move" is
       satisfied by a table that quietly lost a row. These five are the pages
       that render FeatureBlock, and they are the specific risk this ticket ran.

       ⚠️ `features/giving-finance` NOW RESOLVES THROUGH THE_306_MOVED, and the
       assertion is unweakened by that. THE-306 added the Shareable Giving Page's
       vignette to the very component this loop exists to police, so that page
       has a LATER recorded value; the other four still resolve to THE-278's,
       which is what says THE-293's `unbuilt` flag stayed default-off and its
       edit did not leak. A leak from EITHER ticket still moves four pages that
       have no later entry to hide behind.
       ⚠️ `features/community-engagement` NOW RESOLVES THROUGH
       SOLUTIONS_CHURCHES_MOVED, on the same terms as giving-finance above: the
       new `services` MOCKS entry filled in that page's own previously-empty
       Service Planning vignette (see the note on that table), which is a
       legitimate content change to the ONE page that renders a FeatureBlock for
       `services` — not a leak from THE-293's `unbuilt` prop, which THE-293
       itself never touched. */
    for (const page of [
      'features/ai-automation/index.html', 'features/community-engagement/index.html',
      'features/discipleship-content/index.html', 'features/giving-finance/index.html',
      'features/platform-brand/index.html',
    ]) {
      // 🔵 THE_HONEST_OFFER_MOVED JOINS AT THE FRONT — it moved ai-automation
      // (the category intro/SEO no longer sell a newsletter while
      // NEWSLETTER_MARKETING_ENABLED is off). THE-293's claim is untouched.
      expect(BASELINE[page], `${page} renders FeatureBlock and THE-293 moved it`)
        .toBe(THE_372_MOVED[page] ?? MAIN_105_106_MOVED[page] ?? THE_HONEST_OFFER_MOVED[page] ?? THE_370_MOVED[page] ?? THE_358_MOVED[page] ?? SOLUTIONS_CHURCHES_MOVED[page] ?? SOLUTIONS_EVANGELISTIC_MOVED[page] ?? THE_355_MOVED[page] ?? THE_335_MOVED[page]
          ?? THE_314_MOVED[page] ?? THE_306_MOVED[page] ?? THE_280_MOVED[page] ?? PRE_TAILWIND[page]);
    }

    /* 🔵 25 KEYS SINCE SOLUTIONS_MISSIONARIES_ADDED added the third new page.
       The claim here is unchanged — THE-293 added and dropped nothing. */
    // 🔵 28 since #106 added /waitlist (WAITLIST_106_ADDED).
    expect(Object.keys(BASELINE)).toHaveLength(28);
    const others = Object.keys(BASELINE)
      .filter((p) => !(p in THE_293_MOVED) && !(p in THE_301_MOVED) && !(p in THE_306_MOVED)
        && !(p in THE_314_MOVED) && !(p in THE_335_MOVED) && !(p in THE_343_MOVED)
        && !(p in AF7A7BA_MOVED) && !(p in AF7A7BA_ADDED) && !(p in THE_355_MOVED)
        && !(p in SOLUTIONS_EVANGELISTIC_MOVED) && !(p in SOLUTIONS_CHURCHES_MOVED)
        && !(p in SOLUTIONS_CHURCHES_ADDED) && !(p in SOLUTIONS_MISSIONARIES_MOVED)
        && !(p in SOLUTIONS_MISSIONARIES_ADDED)
        && !(p in SKOOL_POST_MOVED) && !(p in SKOOL_POST_ADDED)
        && !(p in WAITLIST_106_ADDED));
    // 🔵 Twenty until THE-301 took two out of the list, THE-306 three more and
    // THE-314 four more (four of its eight were already excluded).
    // 🔵 Nine since THE-343 excluded the Planning Center blog post.
    // 🔵 Six since af7a7ba and THE-355 between them excluded four more and
    // added one key — a net of three off this subset.
    // 🔵 ZERO SINCE SOLUTIONS_EVANGELISTIC_MOVED — every page in this subset
    // now has an entry there too.
    expect(others).toHaveLength(0);
    for (const page of others) {
      expect(BASELINE[page], `${page} moved, and THE-293 had no business moving it`)
        .toBe(THE_335_MOVED[page] ?? THE_284_MOVED[page] ?? THE_280_MOVED[page] ?? PRE_TAILWIND[page]);
    }
  });

  it('🔴 THE-301 moved exactly two pages, and added and dropped none', () => {
    /* The delta, asserted as a delta — the shape THE-280, THE-284 and THE-293
       each used, and the one that catches the failure this ticket could have
       caused. Two blocks went onto two pages; if a third page had moved, that
       would mean a block or a shared component leaked onto a surface nobody
       chose, and it would need a third entry here to pass. */
    expect(Object.keys(THE_301_MOVED).sort()).toEqual(['contact/index.html', 'features/index.html']);

    /* Both really moved, and they moved off the value the tables above record
       for them rather than off some stale earlier one. Neither page has been
       touched since THE-278 fingerprinted it, so that value is PRE_TAILWIND's. */
    for (const page of Object.keys(THE_301_MOVED)) {
      expect(PRE_TAILWIND[page], `${page} is not a page THE-278 fingerprinted`).toBeDefined();
      expect(THE_280_MOVED[page], `${page} is not THE-280's to have moved`).toBeUndefined();
      expect(THE_301_MOVED[page], `${page} is listed as moved but did not move`)
        .not.toBe(PRE_TAILWIND[page]);
    }

    /* 🔴 AND THE OTHER TWENTY ARE STILL AT THEIR RECORDED VALUES — byte for
       byte, against the tables above rather than against a count. This is the
       assertion that says the two blocks are confined to the two pages that
       render them: nothing they touch is shared, so nothing else may move. */
    const others = Object.keys(BASELINE)
      .filter((p) => !(p in THE_301_MOVED) && !(p in THE_306_MOVED) && !(p in THE_314_MOVED)
        && !(p in THE_335_MOVED) && !(p in THE_343_MOVED)
        && !(p in AF7A7BA_MOVED) && !(p in AF7A7BA_ADDED) && !(p in THE_355_MOVED)
        && !(p in SOLUTIONS_EVANGELISTIC_MOVED) && !(p in SOLUTIONS_CHURCHES_MOVED)
        && !(p in SOLUTIONS_CHURCHES_ADDED) && !(p in SOLUTIONS_MISSIONARIES_MOVED)
        && !(p in SOLUTIONS_MISSIONARIES_ADDED)
        && !(p in SKOOL_POST_MOVED) && !(p in SKOOL_POST_ADDED)
        && !(p in WAITLIST_106_ADDED));
    // 🔵 Eleven since THE-314 moved eight of the twenty-two; the claim is
    // unchanged — everything outside the named tables is still at its recorded
    // value.
    // 🔵 Ten since THE-343 excluded the Planning Center blog post on the same
    // terms — the other four pages it moved were already excluded above.
    // 🔵 Seven since af7a7ba and THE-355 between them excluded four more and
    // added one key — a net of three off this subset.
    // 🔵 ZERO SINCE SOLUTIONS_EVANGELISTIC_MOVED — every page in this subset
    // now has an entry there too.
    expect(others).toHaveLength(0);
    for (const page of others) {
      expect(BASELINE[page], `${page} moved, and THE-301 had no business moving it`)
        .toBe(THE_343_MOVED[page] ?? THE_335_MOVED[page] ?? THE_293_MOVED[page]
          ?? THE_284_ADDED[page] ?? THE_284_MOVED[page] ?? THE_280_MOVED[page]
          ?? PRE_TAILWIND[page]);
    }

    // 🔵 25 keys since SOLUTIONS_MISSIONARIES_ADDED added the third new page —
    // nothing added or dropped BY THE-301 itself.
    // 🔵 28 since #106 added /waitlist (WAITLIST_106_ADDED).
    expect(Object.keys(BASELINE)).toHaveLength(28);
  });

  const pagesInDist = (): string[] => {
    const out: string[] = [];
    (function walk(dir: string) {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) walk(abs);
        else if (e.name === 'index.html') out.push(path.relative(DIST, abs).split(path.sep).join('/'));
      }
    })(DIST);
    return out.sort();
  };

  it.runIf(comparable).each(Object.keys(BASELINE))('%s renders exactly as it did before', (page) => {
    const actual = sha(normalise(read(path.join('dist', page))));
    expect(actual, `${page} moved — Tailwind changed an existing page`).toBe(BASELINE[page]);
  });

  it('🔴 THE-306 moved exactly three pages, and added and dropped none', () => {
    /* The delta, asserted as a delta — the shape THE-280, THE-284, THE-293 and
       THE-301 each used. NAMED rather than counted, which matters more here
       than in any of those: `FeatureMock.tsx` is rendered by all six feature
       pages and `catalog.ts` feeds the mega-menu on all twenty-two, so a leak
       had two broad routes out of this ticket and both would surface as a
       fourth entry. */
    expect(Object.keys(THE_306_MOVED).sort()).toEqual([
      'features/giving-finance/index.html', 'index.html', 'pricing/index.html',
    ]);

    /* Each really moved, and off the value the tables above record for it
       rather than off some stale earlier one. `index` and `pricing` were last
       taken by THE-280; the giving page by THE-281, inside PRE_TAILWIND. */
    for (const page of Object.keys(THE_306_MOVED)) {
      expect(PRE_TAILWIND[page], `${page} is not a page THE-278 fingerprinted`).toBeDefined();
      expect(THE_301_MOVED[page], `${page} is not THE-301's to have moved`).toBeUndefined();
      expect(THE_306_MOVED[page], `${page} is listed as moved but did not move`)
        .not.toBe(THE_280_MOVED[page] ?? PRE_TAILWIND[page]);
    }

    /* 🔴 AND THE OTHER NINETEEN ARE STILL AT THEIR RECORDED VALUES — byte for
       byte, against the tables above rather than against a count. In
       particular the four OTHER live category pages and the scheduler page,
       which render the very component this ticket edited: a `FeatureMock` edit
       that reached past the one new key, or a `FeatureBlock` change made to
       accommodate it, would move all five and could not pass this. */
    const untouched = Object.keys(BASELINE)
      .filter((p) => !(p in THE_306_MOVED) && !(p in THE_314_MOVED) && !(p in THE_335_MOVED)
        && !(p in THE_343_MOVED)
        && !(p in AF7A7BA_MOVED) && !(p in AF7A7BA_ADDED) && !(p in THE_355_MOVED)
        && !(p in SOLUTIONS_EVANGELISTIC_MOVED) && !(p in SOLUTIONS_CHURCHES_MOVED)
        && !(p in SOLUTIONS_CHURCHES_ADDED) && !(p in SOLUTIONS_MISSIONARIES_MOVED)
        && !(p in SOLUTIONS_MISSIONARIES_ADDED)
        && !(p in SKOOL_POST_MOVED) && !(p in SKOOL_POST_ADDED)
        && !(p in WAITLIST_106_ADDED));
    // 🔵 Twelve since THE-335 moved ten more, eight of which were already
    // outside this list. THE-306's own claim — that it moved three and no
    // others — is unchanged; the pages it must be measured against are the ones
    // no later ticket has legitimately moved since.
    // 🔵 Ten since THE-343 excluded the two pages it moved that no table above
    // had claimed — the Planning Center blog post and `terms`.
    // 🔵 Seven since af7a7ba and THE-355 between them excluded four more and
    // added one key — a net of three off this subset.
    // 🔵 ZERO SINCE SOLUTIONS_EVANGELISTIC_MOVED — `discipleship-content` and
    // `harvest-scheduler`, the two pages that were this leak test's last
    // remaining witnesses, now legitimately move too: Nav.tsx's Solutions
    // trigger renders on every route, including both of them. That is a
    // sitewide chrome change, not a `FeatureMock`/`FeatureBlock` leak from
    // THE-306, so the two `toContain` assertions this loop used to carry are
    // gone — SOLUTIONS_EVANGELISTIC_MOVED recording both pages is the
    // replacement evidence that nothing else about them changed.
    expect(untouched).toHaveLength(0);
    expect(SOLUTIONS_EVANGELISTIC_MOVED['features/discipleship-content/index.html'],
      'discipleship-content is excluded here but the Nav table does not record it').toBeDefined();
    expect(SOLUTIONS_EVANGELISTIC_MOVED['features/harvest-scheduler/index.html'],
      'harvest-scheduler is excluded here but the Nav table does not record it').toBeDefined();
    expect(THE_355_MOVED['features/platform-brand/index.html'],
      'platform-brand is excluded here but THE-355 does not record it').toBeDefined();
    expect(THE_314_MOVED['features/ai-automation/index.html'],
      'ai-automation is excluded here but THE-314 does not record it').toBeDefined();
    for (const page of untouched) {
      expect(BASELINE[page], `${page} moved, and THE-306 had no business moving it`)
        .toBe(THE_301_MOVED[page] ?? THE_293_MOVED[page] ?? THE_284_ADDED[page]
          ?? THE_284_MOVED[page] ?? THE_280_MOVED[page] ?? PRE_TAILWIND[page]);
    }

    // 🔵 25 keys since SOLUTIONS_MISSIONARIES_ADDED added the third new page —
    // nothing added or dropped BY THE-306 itself.
    // 🔵 28 since #106 added /waitlist (WAITLIST_106_ADDED).
    expect(Object.keys(BASELINE)).toHaveLength(28);
  });

  it('🔴 SOLUTIONS / MISSIONARIES added exactly one page, and moved none of the other twenty-five', () => {
    /* The delta, asserted as a delta — the shape every ticket above this one
       uses. `SOLUTIONS_MISSIONARIES_MOVED` is empty, and this is what checks
       that an empty table is not silently correct: a page that DID move would
       still show up in `others` below and fail there, empty table or not. */
    expect(Object.keys(SOLUTIONS_MISSIONARIES_MOVED)).toEqual([]);
    expect(Object.keys(SOLUTIONS_MISSIONARIES_ADDED)).toEqual(['solutions/missionaries/index.html']);

    // The added page is genuinely new — no earlier table ever fingerprinted it.
    for (const page of Object.keys(SOLUTIONS_MISSIONARIES_ADDED)) {
      expect(PRE_TAILWIND[page], `${page} is not a new page`).toBeUndefined();
      expect(SOLUTIONS_CHURCHES_ADDED[page], `${page} is not a new page`).toBeUndefined();
      expect(SOLUTIONS_EVANGELISTIC_MOVED[page], `${page} is not a new page`).toBeUndefined();
    }

    /* 🔴 AND EVERY ONE OF THE OTHER TWENTY-FIVE IS STILL AT ITS RECORDED
       VALUE — byte for byte, including `features/community-engagement`,
       which is what says this page's tabs and deep dives resolved against
       `FeatureMock.tsx` entries that already existed rather than needing new
       ones that could have leaked onto a live category page the way THE-306's
       `services` key and SOLUTIONS_CHURCHES_MOVED's own entry did. */
    const others = Object.keys(BASELINE)
      .filter((p) => !(p in SOLUTIONS_MISSIONARIES_ADDED) && !(p in SOLUTIONS_TABS_CENTERED_MOVED)
        && !(p in SKOOL_POST_ADDED) && !(p in WAITLIST_106_ADDED));
    // 🔵 Twenty-three since SOLUTIONS_TABS_CENTERED_MOVED excluded the two
    // other pages it moved — churches and evangelistic-organizations. This
    // ticket's own claim, that adding the Missionaries page moved nothing
    // else, is unchanged; centering the tabs is a later, unrelated edit to
    // shared layout the three Solutions pages all render.
    // 🔵 STILL TWENTY-THREE after 525f630 added the 27th route: the new page is
    // excluded as an ADDITION — it did not exist when this ticket ran, so it
    // cannot have been moved by it, which is how SOLUTIONS_CHURCHES_ADDED and
    // AF7A7BA_ADDED are already treated. The three pages 525f630 MOVED stay in
    // this loop and are asserted against SKOOL_POST_MOVED in the chain below.
    expect(others).toHaveLength(23);
    for (const page of others) {
      // 🔵 THE_HONEST_OFFER_MOVED JOINS AT THE FRONT, on identical terms to every
      // table before it: the six pages it moved (homepage meta, Ministry card,
      // FAQ domain clause, AI intro/SEO, Coming Soon Mailchimp, features index)
      // are asserted against ITS values. The claim here — that adding the
      // Missionaries page moved nothing else — is unchanged.
      expect(BASELINE[page], `${page} moved, and adding the Missionaries page had no business moving it`)
        .toBe(THE_372_MOVED[page] ?? MAIN_105_106_MOVED[page] ?? THE_HONEST_OFFER_MOVED[page] ?? SKOOL_POST_MOVED[page] ?? THE_370_MOVED[page] ?? THE_358_MOVED[page] ?? SOLUTIONS_CHURCHES_MOVED[page] ?? SOLUTIONS_CHURCHES_ADDED[page] ?? SOLUTIONS_EVANGELISTIC_MOVED[page]
          ?? THE_355_MOVED[page] ?? THE_343_MOVED[page] ?? THE_335_MOVED[page] ?? AF7A7BA_MOVED[page]
          ?? AF7A7BA_ADDED[page] ?? THE_314_MOVED[page] ?? THE_306_MOVED[page] ?? THE_301_MOVED[page]
          ?? THE_293_MOVED[page] ?? THE_284_ADDED[page] ?? THE_284_MOVED[page] ?? THE_280_MOVED[page]
          ?? PRE_TAILWIND[page]);
    }
  });


  it('🔴 HONEST-OFFER moved exactly six pages, and added and dropped none', () => {
    /* The delta, asserted as a delta — the shape every ticket above this one
       uses. Without it a later edit could add a seventh override and the suite
       would still pass, so the SIZE of the change is checked, not merely its
       content. */
    expect(Object.keys(THE_HONEST_OFFER_MOVED).sort()).toEqual([
      'faq/index.html', 'features/ai-automation/index.html',
      'features/coming-soon/index.html', 'features/index.html',
      'index.html', 'pricing/index.html',
    ]);
    for (const page of Object.keys(THE_HONEST_OFFER_MOVED)) {
      const previous = THE_370_MOVED[page] ?? THE_358_MOVED[page] ?? THE_301_MOVED[page]
        ?? THE_284_MOVED[page] ?? PRE_TAILWIND[page];
      expect(THE_HONEST_OFFER_MOVED[page], `${page} is listed as moved but did not move`)
        .not.toBe(previous);
    }
    // 🔵 28 since #106 added /waitlist (WAITLIST_106_ADDED).
    expect(Object.keys(BASELINE)).toHaveLength(28);
  });

  it('🔴 MAIN_105_106 moved exactly nine pages and added one, and dropped none', () => {
    /* The delta, asserted as a delta — the shape every table above uses. */
    expect(Object.keys(MAIN_105_106_MOVED).sort()).toEqual([
      'blog/planning-center-alternative-small-churches/index.html',
      'faq/index.html', 'features/community-engagement/index.html',
      'features/giving-finance/index.html', 'index.html', 'pricing/index.html',
      'solutions/churches/index.html', 'solutions/evangelistic-organizations/index.html',
      'solutions/missionaries/index.html',
    ]);
    expect(Object.keys(WAITLIST_106_ADDED)).toEqual(['waitlist/index.html']);
    const chain = { ...PRE_TAILWIND, ...THE_280_MOVED, ...THE_284_MOVED, ...THE_284_ADDED, ...THE_293_MOVED,
      ...THE_301_MOVED, ...THE_306_MOVED, ...THE_314_MOVED, ...THE_335_MOVED,
      ...THE_343_MOVED, ...AF7A7BA_MOVED, ...AF7A7BA_ADDED, ...THE_355_MOVED,
      ...SOLUTIONS_EVANGELISTIC_MOVED, ...SOLUTIONS_CHURCHES_MOVED, ...SOLUTIONS_CHURCHES_ADDED,
      ...SOLUTIONS_MISSIONARIES_MOVED, ...SOLUTIONS_MISSIONARIES_ADDED,
      ...SOLUTIONS_TABS_CENTERED_MOVED, ...THE_358_MOVED,
      ...SKOOL_POST_MOVED, ...SKOOL_POST_ADDED, ...THE_370_MOVED, ...THE_HONEST_OFFER_MOVED } as Record<string, string>;
    for (const page of Object.keys(MAIN_105_106_MOVED)) {
      expect(chain[page], `${page} is not a page that existed`).toBeDefined();
      expect(MAIN_105_106_MOVED[page], `${page} is listed as moved but did not move`).not.toBe(chain[page]);
    }
    expect(chain['waitlist/index.html'], 'waitlist is listed as added but already existed').toBeUndefined();
  });

  it('🔴 THE-372 moved exactly seven pages, and added and dropped none', () => {
    expect(Object.keys(THE_372_MOVED).sort()).toEqual([
      'blog/planning-center-alternative-small-churches/index.html',
      'blog/skool-alternative-for-churches/index.html',
      'blog/year-end-giving-statements-what-to-include/index.html',
      'faq/index.html', 'index.html', 'pricing/index.html', 'terms/index.html',
    ]);
    for (const page of Object.keys(THE_372_MOVED)) {
      const previous = MAIN_105_106_MOVED[page] ?? THE_HONEST_OFFER_MOVED[page] ?? THE_370_MOVED[page]
        ?? SKOOL_POST_MOVED[page] ?? SKOOL_POST_ADDED[page] ?? THE_358_MOVED[page] ?? THE_355_MOVED[page]
        ?? THE_343_MOVED[page] ?? AF7A7BA_ADDED[page] ?? PRE_TAILWIND[page];
      expect(previous, `${page} is not a page that existed`).toBeDefined();
      expect(THE_372_MOVED[page], `${page} is listed as moved but did not move`).not.toBe(previous);
    }
    expect(Object.keys(BASELINE)).toHaveLength(28);
  });

  it.runIf(comparable)('and the whole set matches as one number', () => {
    /* The per-page results say WHICH page moved; this says whether the SET
       moved, so an added or dropped page is caught as well as an edited one. */
    const combined = sha(
      pagesInDist().map((r) => `${r}:${sha(normalise(read(path.join('dist', r))))}`).join('\n'),
    );
    expect(combined, 'some prerendered page changed').toBe(BASELINE_ALL_PINS[BASELINE_ALL_PINS.length - 1]);
  });
});

/* ═══ 6b — and the site's own CSS survives in the built stylesheet ════════ */
describe('6b — the hand-written stylesheet still ships, outside Tailwind\'s layers', () => {
  const distCssPath = () => {
    const dir = path.join(DIST, 'assets');
    const f = readdirSync(dir).find((n) => n.endsWith('.css'));
    return f ? path.join(dir, f) : null;
  };
  const hasCss = built && distCssPath() !== null;
  const css = hasCss ? readFileSync(distCssPath()!, 'utf8') : '';

  /** Everything Tailwind contributes lives in a layer; removing them leaves
   *  exactly the site's own rules. Brace-matched so nesting is safe. */
  const unlayered = (() => {
    let out = '';
    for (let i = 0; i < css.length;) {
      const m = /^@layer\s+[a-zA-Z, ]+\{/.exec(css.slice(i));
      if (!m) { out += css[i]; i++; continue; }
      let depth = 0, j = i + m[0].length - 1;
      for (; j < css.length; j++) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') { depth--; if (depth === 0) { j++; break; } }
      }
      i = j;
    }
    return out;
  })();

  /** Every class the 42 components actually spell. */
  const SITE_CLASSES = [
    'hbtn', 'hb-main', 'hb-dot', 'hb-label', 'hb-alt', 'hmarq', 'hmarq-track',
    'bento', 'bento-body', 'bento-cta', 'nav-hamburger', 'replaces-row',
    'blog-thumb', 'blog-body', 'blog-table-wrap', 'blog-figure', 'blog-img-frame',
    'faq-summary', 'faq-chevron', 'faq-item', 'feat-index-card', 'soon-index-card',
  ];

  it.runIf(hasCss)('Tailwind\'s output is layered and the site\'s rules are not', () => {
    expect(css).toMatch(/@layer\s+theme/);
    expect(css).toMatch(/@layer\s+utilities/);
    /* Unlayered rules beat layered ones at equal specificity, which is the
       whole reason no hand-written rule lost an argument. */
    expect(unlayered).toMatch(/\.blog-body/);
    expect(unlayered).toMatch(/:root\s*\{/);
  });

  it.runIf(hasCss).each(SITE_CLASSES)('.%s still has its own rule', (cls) => {
    expect(unlayered, `.${cls} vanished from the built stylesheet`).toContain(`.${cls}`);
  });

  it.runIf(hasCss)('the tokens the whole site reads still hold Harvest\'s values', () => {
    /* Tailwind's theme declares --font-sans, --font-serif, --radius-*, --shadow-*,
       --ease-* and --leading-* too. If its defaults had won, these would be
       system stacks and the site would have silently lost its typography. */
    expect(unlayered).toMatch(/--font-serif:\s*"?Fraunces/i);
    expect(unlayered).toMatch(/--font-sans:\s*"?Inter/i);
    expect(unlayered.toLowerCase()).toContain('--gold-500:#c9963a');
    expect(unlayered).toMatch(/--radius-lg:\s*12px/);
    expect(unlayered).toMatch(/--ease-out:\s*cubic-bezier\(\.22,\s*1,\s*\.36,\s*1\)/);
  });

  it.runIf(hasCss)('🔴 Preflight is NOT in the bundle', () => {
    /* The single change that would have moved every page: Tailwind's reset
       flattens headings to font-size:inherit, unstyles lists, and makes images
       block. None of its signatures may appear. */
    expect(css).not.toMatch(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-size:\s*inherit/);
    expect(css).not.toMatch(/abbr:where\(\[title\]\)/);
    expect(css).not.toMatch(/img,\s*svg,\s*video,\s*canvas/);
    expect(css).not.toMatch(/ol,\s*ul,\s*menu\s*\{[^}]*list-style:\s*none/);
  });

  it.runIf(hasCss)('🔴 the site\'s own CSS is pinned in the BUILT stylesheet, declaration for declaration', () => {
    /* The page fingerprints above cannot see this: changing `.blog-thumb` from
       148px to 149px moves no markup, and the asset filename is normalised
       away. Only a pin on the emitted CSS catches an edit to an existing rule
       in the built output rather than in the source.
       Pinned post-Tailwind on purpose — the pre-Tailwind bytes were minified by
       a different engine (postcss+esbuild, now Lightning CSS), so the two are
       not byte-comparable. Equivalence with the pre-Tailwind build is
       established by test 7: the source region is unmodified. */
    const banner = /^\/\*![^*]*\*\//;
    expect(sha(unlayered.replace(banner, '').trim())).toBe(
      'b2bf9da491ce9fa3dd43e84ac10d1dd6120ce0332675c25fb90ecb20997c8aaf',
    );
  });

  it.runIf(hasCss)('the media queries the responsive rules live in are still there', () => {
    for (const q of ['1080px', '900px', '560px', '640px']) {
      expect(unlayered, `the ${q} breakpoint is gone`).toContain(q);
    }
    expect(unlayered).toContain('prefers-reduced-motion');
  });
});

/* ═══ 7 — no existing rule in index.css was modified ══════════════════════ */
describe('7 — index.css\'s original 400 lines are untouched', () => {
  /* The stylesheet at 15876ff, byte for byte. */
  const ORIGINAL_SHA = '59cf429368d78c8fbecea0ee27ad20423fafd66e98e98a06646dca60729b0d18';
  const END_OF_PREPEND = '/* ── THE-278 ends here; everything below is the original stylesheet ── */\n';
  const START_OF_APPEND = '/* ── THE-278: shadcn plain tokens, appended below the original ── */\n';

  const css = read('src/index.css');

  it('the ticket added a block above and a block below, and nothing in between', () => {
    expect(css, 'the prepend marker is missing').toContain(END_OF_PREPEND);
    expect(css, 'the append marker is missing').toContain(START_OF_APPEND);
    expect(css.indexOf(END_OF_PREPEND)).toBeLessThan(css.indexOf(START_OF_APPEND));
  });

  it('🔴 the original stylesheet survives as one contiguous, unmodified region', () => {
    const from = css.indexOf(END_OF_PREPEND) + END_OF_PREPEND.length;
    const to = css.indexOf(START_OF_APPEND);
    expect(sha(css.slice(from, to)), 'an existing rule in index.css was modified').toBe(ORIGINAL_SHA);
  });

  it('and the declarations the site already had still resolve to what they did', () => {
    /* A spot check in the language a reader thinks in, so a hash mismatch is not
       the only signal. */
    for (const [name, value] of [
      ['--gold-500', '#C9963A'], ['--navy-900', '#0C1526'], ['--cream', '#FAF8F5'],
      ['--radius-lg', '12px'], ['--text-soon', '#6D6A66'],
    ] as const) {
      expect(css).toMatch(new RegExp(`${name}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*;`));
    }
    /* --font-sans and --font-serif are the two the whole site reads (37 and 70
       call sites). Tailwind's theme declares both names; these must still be
       Harvest's. */
    expect(css).toMatch(/--font-serif:\s*"Fraunces"/);
    expect(css).toMatch(/--font-sans:\s*"Inter"/);
  });
});

/* ═══ 8 — the cross-repo price contract ══════════════════════════════════ */
describe('8 — the nine plan prices are unchanged and the contract still has teeth', () => {
  const NINE = {
    plus: { monthly: 20, quarterly: 54, yearly: 190 },
    pro: { monthly: 40, quarterly: 108, yearly: 380 },
    max: { monthly: 80, quarterly: 216, yearly: 752 },
  } as const;

  it('all nine prices are exactly what the app charges', () => {
    for (const [planId, terms] of Object.entries(NINE)) {
      const plan = plans.find((p) => p.planId === planId);
      if (plan === undefined) throw new Error(`plan ${planId} vanished from the table`);
      for (const [term, price] of Object.entries(terms)) {
        expect(plan.price[term as keyof Plan['price']], `${planId} ${term}`).toBe(price);
      }
    }
  });

  it('the contract passes against the shipped table', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 and still THROWS when the two repos disagree — a contract nobody has seen fail is not a contract', () => {
    const wrong = plans.map((p) =>
      p.planId === 'pro' ? { ...p, price: { ...p.price, yearly: p.price.yearly + 1 } } : p,
    );
    expect(() => planPriceContract(wrong)).toThrow(/pro/);
  });

  it('it throws at MODULE SCOPE, which is what fails the prerender', () => {
    /* Not `git show` at assertion time — the source as it sits on disk. */
    const src = read('src/components/Pricing.tsx');
    expect(src).toMatch(/^planPriceContract\(plans\);$/m);
  });
});

/* ═══ 9 — the prerendered page count ═════════════════════════════════════ */
describe('9 — the prerender list and the built page count are unchanged', () => {
  it('blogRoutes() lists 23 routes', () => {
    /* The same number LegalPage.test.ts pins. Asserted again here because
       THE-278 was the ticket that could have moved it, by changing what the
       build does rather than what the route table says — and that claim still
       holds: the one route added since is THE-284's Harvest Scheduler page,
       which is a route in the table, not a change to the build. */
    /* 🔴 23 SINCE 2026-09-10, AND NOT BECAUSE OF THIS TICKET. The
       `inside-harvest` post "What your year-end giving statements must include"
       (af7a7ba) added a 23rd route. CI runs on `pull_request` only and `main` is
       unprotected, so that direct blog push never ran this suite and every PR
       opened after it has been red on this assertion — the same failure mode
       THE-252 found at 21 and recorded in LegalPage.test.ts, one post later.
       Corrected here rather than in the ticket that eventually trips over it.
       ⚠️ THE-355 ITSELF ADDS NO ROUTE. It adds a SECTION to a page that already
       renders — /features/giving-finance — and a section is an anchor, not a
       page.
       🔴 24 SINCE SOLUTIONS_EVANGELISTIC_MOVED, board card 86bbyv8pp — the new
       /solutions/evangelistic-organizations route, appended above the
       catch-all in App.tsx for the reason documented there.
       🔴 25 SINCE SOLUTIONS_CHURCHES_ADDED, same board card, part two — the new
       /solutions/churches route, appended the same way, above the catch-all,
       right after the evangelistic-organizations entry — both are one line
       each, since both are `...SOLUTIONS.map((s) => ...)` spreads keyed off
       content/solutions.ts rather than a route added by hand.
       🔴 26 SINCE SOLUTIONS_MISSIONARIES_ADDED, same board card, part three —
       the new /solutions/missionaries route, appended the same way, right
       after the churches entry — again one line, from the same
       `...SOLUTIONS.map((s) => ...)` spread. */
    /* 🔵 27 SINCE 525f630 — the `skool-alternative-for-churches` post, pushed
       STRAIGHT TO main and so never CI-tested: this workflow runs on
       `pull_request` only, and its own header says "a direct push to it now
       gets no CI at all". It is the 27th route. NOT THE-370's, and corrected
       here only because CI gates both repos' PRs on it — see the PR. */
    /* 🔵 28 SINCE feat/lead-capture-waitlist — `/waitlist` added to
       `STATIC_ROUTES` and `blogRoutes()` so SSG prerenders WaitlistPage
       (App.tsx already had the router entry; dist/waitlist/ was missing). */
    expect(blogRoutes()).toHaveLength(28);
  });

  it.runIf(built)('and the build emits all 28 of them', () => {
    /* The list and the build agree: 28 routes in, 28 pages out.
       🔵 27 → 28 WITH `/waitlist` on feat/lead-capture-waitlist (prerender fix).
       🔵 26 → 27 AT 525f630, the `skool-alternative-for-churches` post pushed
       straight to main (see the note on `blogRoutes()` above). NOT THE-370's.
       ⚠️ ON A win32 CHECKOUT THIS FAILS LOW, and the failure is correct —
       that build really is missing the blog posts, for the slugFromPath
       reason noted at the top of this file. Asserted rather than skipped so a
       broken local build is visible instead of self-consistent. */
    const count = (function walk(dir: string): number {
      let n = 0;
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) n += walk(abs);
        else if (e.name === 'index.html') n += 1;
      }
      return n;
    })(DIST);
    expect(count, `this checkout built ${count} pages, not 28`).toBe(28);
  });
});

/* ═══ 10 — the build configuration is untouched ══════════════════════════ */
describe('10 — vercel.json, vite.config.ts and the blog plugin are byte-identical', () => {
  /* ⚠️ THE BLOG PLUGIN'S HASH MOVED AT THE-284, AND ONLY ITS HASH.
   *
   * `blogRoutes()` and `STATIC_ROUTES` are the prerender list and the sitemap,
   * and a new page has to be in both — there is no way to add a route without
   * editing this file, so a pin that could never be repinned would be a pin
   * against ever adding a page. What the pin is really holding is that the
   * PLUGIN was not changed: not the parser, not the image measurement, not the
   * watch graph, not the virtual module. That claim is checked in its own right
   * two tests below, against the source rather than against a hash.
   *
   * 🔴 vercel.json AND vite.config.ts DID NOT MOVE, and those are the two that
   * matter most here. `base: '/'` is absolute deliberately — a relative base
   * breaks nested prerendered routes — and `ssgOptions.dirStyle` still nests.
   * A new page needed neither touched.
   *
   * 🔴 THE BLOG PLUGIN'S HASH MOVED AGAIN AT board card 86bbyv8pp
   * (SOLUTIONS_EVANGELISTIC_MOVED) — three lines, adding the new
   * `/solutions/evangelistic-organizations` route to both `STATIC_ROUTES`
   * (the sitemap) and `blogRoutes()` (the prerender list), the same shape
   * THE-284 used to add the Harvest Scheduler page. The plugin itself is
   * unedited — see the assertion against its source two tests below.
   */
  it.each([
    ['vercel.json', 'b7c29796ec5df5d87332d573d130ea805956078bd5d3753cef537b2ac73a87be'],
    ['vite.config.ts', '709677152f5cb12c9f081bbe900643f4f6529d604c749037d16bf7c23de4af66'],
    ['build/blog-plugin.ts', '5f3549d2464886c8c806ec82eb8a1a94e69a62af1c179faf294c530235c262c2'],
  ])('%s is unchanged', (file, hash) => {
    expect(sha(readFileSync(path.join(ROOT, file))), `${file} was modified`).toBe(hash);
  });

  it('🔴 the blog plugin changed only its route list — the plugin itself is untouched', () => {
    /* What the hash above used to say on its own. Spelled out against the
       source so that repinning it for a new route cannot quietly cover an edit
       to the machinery: the parser, the image measurement, the sitemap shape,
       the virtual module and the watch graph are all still exactly as they
       were, and the diff at THE-284 is three lines of route list. */
    const plugin = read('build/blog-plugin.ts');
    expect(plugin).toMatch(/export function blogPlugin\(\): Plugin \{/);
    expect(plugin).toMatch(/const VIRTUAL_ID = 'virtual:blog-content';/);
    expect(plugin).toMatch(/const SIZE_WARN_BYTES = 400 \* 1024;/);
    expect(plugin).toMatch(/fs\.writeFileSync\(SITEMAP_FILE, sitemapXml\(posts\), 'utf8'\);/);
    expect(plugin).toMatch(/for \(const file of postFiles\(\)\) this\.addWatchFile\(file\);/);
    expect(plugin).toMatch(/\.\.\.readPublishedPosts\(\)\.map\(\(p\) => `\/blog\/\$\{p\.slug\}`\),/);
    /* And the new route is DERIVED from the content module, not typed as a
       literal here — the same property every other route in the list has, so
       the path cannot drift between the router and the prerender list. */
    expect(plugin).toMatch(/import \{ COMING_SOON_HREF, SCHEDULER_HREF \} from '\.\.\/src\/content\/coming-soon';/);
    expect(plugin, 'a route path was typed as a literal').not.toContain("'/features/harvest-scheduler'");
  });

  it('base is still absolute, and ssgOptions still nests', () => {
    /* Spelled out as well as hashed: the hash says "something moved", these say
       which promise broke. A relative base breaks nested prerendered routes. */
    const vite = read('vite.config.ts');
    expect(vite).toMatch(/base:\s*'\/'/);
    expect(vite).toMatch(/dirStyle:\s*'nested'/);
  });
});
