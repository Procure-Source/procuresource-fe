# Styling & Layout Architecture — TailwindCSS + shadcn/ui, Mobile-First

Companion to `procuresource_skill_v2.md` (architecture) and `tanstack_query_architecture_nextjs16.md` (data). This document owns everything visual: design tokens, Tailwind rules, shadcn/ui ownership, the mobile-first doctrine, how future third-party libraries are absorbed without breaking the layout, and how layout integrity is verified.

**How an AI agent uses this document:**

1. Style only through the **token system** (§1) and the **styling layer model** (§2)
2. Build every screen **mobile-first** per the doctrine (§5) — no exceptions
3. When adding any new UI library, run the **Library Integration Protocol** (§6)
4. Before completing any UI change, run the **Layout Verification Protocol** (§7)

---

## 1. Design Token Architecture

Tailwind v4 is CSS-first: tokens are CSS variables declared with `@theme` in `globals.css`, and shadcn/ui consumes semantic tokens (`--background`, `--foreground`, `--primary`, …). This is the intended system — do not fight it, do not reintroduce a JS config color palette.

### 1.1 Three token layers

```css
/* globals.css */
@theme {
  /* Layer 1 — primitives (raw values, OKLCH). Never referenced by components. */
  --color-blue-600: oklch(0.55 0.18 255);

  /* Layer 2 — semantic (purpose-driven). What components use. */
  --color-primary: var(--color-blue-600);
  --color-primary-foreground: oklch(0.98 0 0);
  --color-destructive: …;
  --color-muted: …;
  --radius-md: 0.5rem;

  /* Motion + z-index are tokens too */
  --duration-fast: 150ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
.dark {
  /* Dark mode = overriding the SAME semantic tokens. Never per-component dark hacks. */
  --color-primary: …;
}
```

### 1.2 Token rules

- Components reference **semantic tokens only** (`bg-primary`, `text-muted-foreground`) — never primitives, never raw values. `bg-[#3b82f6]` and `text-blue-600` in feature code are defects.
- Dark mode works exclusively by overriding semantic tokens under `.dark`. A component that mentions `dark:` for anything other than a genuine structural difference is routing around the token system.
- Spacing, radius, shadows, z-index, and motion come from the scale. Arbitrary values (`w-[347px]`, `z-[9999]`, `mt-[13px]`) require a comment justifying why the scale cannot express it — and are usually a smell that the layout is fighting its container.
- **Z-index scale is closed:** define a small ladder (`--z-dropdown`, `--z-sticky`, `--z-overlay`, `--z-modal`, `--z-toast`) and use only those. Z-index wars are how third-party libraries break layouts (§6).

---

## 2. Styling Layer Model

Styling ownership follows the component layers from skill v2. Each layer may style only what it owns:

| Layer | Owns | Must not |
|---|---|---|
| `globals.css` | Tokens, base resets, font setup | Component-specific styles |
| `components/ui/` (shadcn) | Primitive appearance + variants (cva) | Layout of its surroundings, feature spacing |
| `components/common/` | Composition of primitives, internal spacing | Page-level layout, margins pushing external content |
| `components/layout/` (AppShell, Sidebar…) | The page grid, scroll containers, responsive frame | Feature visuals |
| `features/*/components/` | Arrangement of primitives inside its region | Redefining primitive appearance, global CSS, new colors |

Core mechanics:

- **`cn()` (clsx + tailwind-merge) for all conditional classes.** String concatenation of class names is forbidden — and dynamically built class names (`bg-${color}-500`) are invisible to Tailwind's scanner and silently produce no CSS. Class names must always appear complete in the source.
- **Variants via `cva`** on the primitive, not via ad-hoc overrides at call sites. If a button needs a new look in three places, that is a new variant in `components/ui/button.tsx`, not three `className` patches.
- **Components must not style their own external margins.** Parents own the spacing between children (`gap-*`, `space-y-*`); components own only their internal layout. This is what makes components portable across contexts.
- **One scroll container.** AppShell owns page scrolling. Nested scroll areas are deliberate, rare, and use the ScrollArea primitive. Accidental double scrollbars are a layout defect.
- No inline `style={}` except for genuinely dynamic values (computed chart dimensions, transform positions) — with a comment.
- No `@apply` except in the rare base-layer case; it hides utilities from review and recreates the CSS-file indirection Tailwind exists to remove.

---

## 3. shadcn/ui Ownership Rules

shadcn components are **application-owned source code**, not a dependency. That grants rights and duties:

- **Extend via variants, don't fork.** New appearance = new cva variant. Duplicating `button.tsx` into `button-2.tsx` is a parallel implementation (banned by skill v2).
- **Don't wrap without value.** A `<MyButton>` that renders `<Button>` with no added behavior is indirection debt. Wrap only to add real app semantics (e.g., `ConfirmDialog` in `components/common/`).
- **Preserve the accessibility core.** The Radix/behavior layer (focus trapping, aria wiring, keyboard paths) is the part you must not degrade when editing. Visual changes: fine. Removing `asChild` composition, focus rings, or aria attributes: defect.
- **Record customizations.** Keep a short manifest (`components/ui/CUSTOMIZATIONS.md`) listing which components diverge from upstream and why — this is what makes re-pulling upstream updates safe.
- Prefer composition (`asChild`, slots, children) over prop-drilling booleans into primitives (`isDashboardVariant` on a Button is feature logic leaking down a layer).

---

## 4. Layout System

- **AppShell defines the responsive frame once:** sidebar behavior (off-canvas drawer on mobile → collapsible rail on `md` → full sidebar on `lg`), header, content area with consistent page padding (`px-4 md:px-6 lg:px-8`), and the single scroll container. Features never rebuild any part of this frame.
- Content regions use **CSS Grid for 2-D page structure, Flexbox for 1-D component flow**. Fixed pixel widths on content are forbidden; use `max-w-*` + `w-full` + `min-w-0`. (Most broken-table/overflow bugs are a missing `min-w-0` on a flex/grid child.)
- Page-level vertical rhythm uses a consistent spacing scale (`space-y-6`/`gap-6` at page level, `gap-4` within sections). Pick the ladder once; drift is a defect.
- Breakpoints are Tailwind defaults (`sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem). Do not add custom breakpoints without approval — container queries (§5.3) are almost always the right answer instead.

---

## 5. Mobile-First Doctrine (Strict)

This repository follows strict mobile-first design. It is not a preference; it is the construction order.

### 5.1 The rules

1. **Unprefixed utilities are the mobile design.** Every component is written for ~360px first and must be fully usable there. `sm:`/`md:`/`lg:` add enhancements for larger screens — they never "fix mobile."
2. **`max-*` variants are forbidden as a primary strategy.** Styling desktop first and subtracting with `max-md:` inverts the doctrine. Legitimate `max-*` uses (hiding a desktop-only affordance) need a comment.
3. **No desktop-only features hidden on mobile without a product decision.** `hidden lg:block` on functionality (not decoration) means mobile users lose capability — that requires explicit approval, not styling convenience.
4. **Touch first:** minimum 44×44px hit targets (`h-11` class territory) for interactive elements on mobile; hover is an enhancement, never the only path to an action (hover-revealed buttons must also be reachable by tap/focus).
5. **Content must survive:** long unbroken strings (`break-words`/`truncate` + `title`), empty states, and 10× data volume must not break the frame. Overflow is designed, not accidental — horizontal scroll appears only where declared (tables in `overflow-x-auto` wrappers).
6. **Dynamic viewport units** (`h-dvh`, not `h-screen`) for full-height mobile layouts — mobile browser chrome makes `100vh` wrong.
7. Respect safe areas (`env(safe-area-inset-*)`) on fixed mobile bars; respect `prefers-reduced-motion` for all non-trivial animation.

### 5.2 Canonical responsive patterns

| Pattern | Mobile (base) | Larger screens |
|---|---|---|
| Page grid | single column stack | `md:grid-cols-2 lg:grid-cols-3` |
| Sidebar | off-canvas Sheet/drawer | `md:` rail → `lg:` full sidebar |
| Data tables (TanStack Table) | card list or `overflow-x-auto` with pinned key column | full table |
| Dialogs | full-screen / bottom sheet | `sm:` centered modal |
| Forms | single column, stacked labels | `md:grid-cols-2` where scannability wins |
| Toolbars/filters | collapsed into Popover/Sheet | inline row |

### 5.3 Container queries for component-level responsiveness

Viewport breakpoints describe the device; **container queries describe the space a component actually has** — and the same component may render in a full page, a half-width panel, and a dashboard card. Built into Tailwind v4, also mobile-first (`@md:` applies at container size and up):

```tsx
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3">…</div>
</div>
```

**Rule:** shared/common components that appear in multiple contexts respond to their **container**, not the viewport. Viewport breakpoints are reserved for the AppShell frame and page-level composition. This is what keeps the layout extensible: new placements of existing components cannot break, because the component adapts to whatever space it is given.

---

## 6. Library Integration Protocol — Adding Any Future UI Library

Any new visual library (charts, rich text editor, date picker, maps, DnD, …) enters through this protocol. The goal: the library adopts **our** tokens, layout discipline, and mobile-first behavior — never the reverse.

### Step 1 — Justify (skill v2 dependency rules)

Confirm: shadcn/Radix or an existing dependency cannot do it; the library is actively maintained; complexity is justified; no overlapping library already exists (one chart lib, one date lib — never two).

### Step 2 — Evaluate against admission criteria

Score before installing:

- **Headless or unstyled-first** (best) > styleable via CSS variables > opinionated styled (needs strong justification) > iframe/canvas-only black box (last resort, quarantined)
- **Themeable with our tokens** — can its colors/fonts/radii be driven by our CSS variables?
- **Accessibility** — keyboard support, aria correctness out of the box
- **Responsive behavior** — does it resize with its container (`ResizeObserver`/percent widths), or does it demand fixed pixel dimensions?
- **SSR/RSC compatibility** — does it render server-side, or is it client-only (needs `next/dynamic`, affects hydration §skill v2 §6)?
- **Bundle cost** — check size; heavy libraries are lazy-loaded per §skill v2 §15
- **Style delivery** — scoped styles/variables (good) vs. a global stylesheet that resets or bleeds (bad; must be containable)

### Step 3 — Integrate behind an adapter

- The library is imported **only** inside one adapter in `components/ui/` (or `components/common/` if app-semantic). Feature code imports the adapter, never the library. This keeps the library swappable and its API surface controlled.
- **Map its theme to our tokens** in the adapter — chart palettes, editor colors, focus rings all read our CSS variables. Zero hardcoded colors introduced.
- If it ships CSS, import it **once** in the adapter layer and verify scope: it must not restyle global elements, override shadcn primitives, or inject its own resets. If it does and can't be configured otherwise, contain it under a wrapper class or reject it.
- **Z-index:** its popovers/tooltips/modals are assigned levels from our ladder (§1.2). Verify its overlays compose with our Dialog/Popover (open both together in the test).
- **Portals:** confirm where it portals overlays; overlays must escape `overflow-hidden` ancestors and respect our stacking order.
- Client-only libraries load via `next/dynamic` with a skeleton sized to prevent layout shift; heavy ones lazy-load on route/interaction.
- The adapter is **mobile-first like everything else**: sized by its container (`w-full` + aspect ratio or container queries), touch interactions verified, never a fixed 800px canvas.

### Step 4 — Verify before merging

Run the full Layout Verification Protocol (§7) on: the new component in situ, plus one page each containing our Dialog, Dropdown, and Toast simultaneously with the new library's overlays (stacking-context regressions), in light and dark mode.

---

## 7. Layout Verification Protocol

Layout correctness is verified, not assumed. Run this after any UI change; agents with browser access run it directly (dev server + browser tooling), otherwise produce the checklist for the developer.

### 7.1 Viewport matrix

Verify every changed screen at minimum:

| Width | Represents | Must check |
|---|---|---|
| 320px | smallest supported phone | nothing unusable, no clipped controls |
| 375–390px | common phones | primary flows fully operable, touch targets ≥44px |
| 768px | tablet / `md` | sidebar transition, grid steps |
| 1024px | small laptop / `lg` | full frame appears correctly |
| 1440px+ | desktop | `max-w` containers hold; no infinite line lengths |

Plus one **in-between check** (~500px, ~900px): layouts must degrade continuously, not only look right exactly at breakpoints.

### 7.2 Pass conditions (each viewport)

1. **No unintended horizontal scroll.** Programmatic check: `document.documentElement.scrollWidth <= window.innerWidth`. Any declared horizontal scroll is inside its `overflow-x-auto` wrapper only.
2. **Stress content:** longest realistic strings, an unbroken 60-char token, empty state, and 10× rows — frame intact, truncation/wrapping behaves as designed.
3. **Interactive reachability:** every action usable via touch and keyboard; focus visible; nothing reachable only by hover.
4. **Overlays:** dialogs, dropdowns, toasts, and any third-party overlays open correctly, in the right stacking order, unclipped.
5. **Both themes:** light and dark (token overrides only — if dark mode needs component edits, the token system was bypassed).
6. **Zoom 200%** (accessibility requirement): layout reflows, no loss of functionality.
7. **No layout shift** from late-loading content: images have dimensions/aspect ratios, skeletons match final size, dynamic imports reserve space.

### 7.3 Static audit (grep-able defects)

```bash
grep -rn "style={{"                 src/features/ src/components/   # inline styles
grep -rnE "\[(#|[0-9]+px)\]"        src/features/                   # arbitrary hex/px values
grep -rn "z-\[" src/ | grep -v "z-(var"                             # off-ladder z-index
grep -rnE "max-(sm|md|lg|xl):"      src/                            # desktop-first leaks
grep -rnE "w-\[[0-9]+px\]|h-screen" src/                            # fixed widths, h-screen vs h-dvh
grep -rnE "bg-\$|text-\$"           src/                            # dynamically built class names
grep -rn "dark:" src/features/                                       # dark-mode hacks outside tokens
```

Every hit is either fixed or justified with a comment. For regression safety on high-traffic screens, screenshot comparison at the §7.1 widths (e.g., Playwright) is the sanctioned automation; adopt when the team approves the dependency.

### 7.4 Layout bug debugging

Layout bugs follow the same ownership discipline as skill v2 §14. The usual suspects, in order: a child styling its own external margin (§2), a missing `min-w-0`/`min-h-0` on a flex/grid child, a fixed width fighting a fluid container, an off-ladder z-index, or a third-party stylesheet leaking. Find the owning layer; never patch with `!important`, arbitrary z-index escalation, or compensating negative margins — those are the styling equivalents of the banned fixes list.

---

## 8. Anti-Pattern Catalog

| # | Anti-pattern | Fix |
|---|---|---|
| 1 | Hardcoded colors / arbitrary hex in components | Semantic tokens (§1) |
| 2 | `dark:` fixes in feature components | Override tokens under `.dark` |
| 3 | Desktop-first construction, `max-*` subtraction | Rebuild mobile-first (§5.1) |
| 4 | Dynamically constructed class names | Complete class names + `cn()` (§2) |
| 5 | Component styling its own external margins | Parent owns spacing via `gap` (§2) |
| 6 | Call-site `className` patches recreating a variant repeatedly | New cva variant on the primitive (§3) |
| 7 | Forked copies of shadcn primitives | Variants; delete the fork |
| 8 | `z-[9999]` escalation | Z-index ladder (§1.2) |
| 9 | Fixed pixel widths on content | `max-w-*` + `w-full` + `min-w-0` (§4) |
| 10 | `h-screen` on mobile full-height layouts | `h-dvh` (§5.1) |
| 11 | Library imported directly in feature code | Adapter in `components/ui` (§6) |
| 12 | Library stylesheet leaking globally | Scope/contain or reject (§6) |
| 13 | Hover-only interactions | Tap/focus-reachable equivalents (§5.1) |
| 14 | Viewport breakpoints inside shared components | Container queries (§5.3) |
| 15 | Nested accidental scroll containers | AppShell owns scroll; ScrollArea deliberately (§2) |
| 16 | `!important`, compensating negative margins | Find the owning layer (§7.4) |

---

## 9. Definition of Done — UI changes

- [ ] All colors/spacing/z-index/motion from tokens; no arbitrary values without a justifying comment
- [ ] Built mobile-first: base = mobile, enhancements via `min-width` prefixes; container queries used in shared components
- [ ] Touch targets ≥44px; keyboard + focus paths intact; reduced motion respected
- [ ] Component owns no external margins; no new scroll containers; no off-ladder z-index
- [ ] New library (if any) passed the §6 protocol: justified, evaluated, adapter-wrapped, token-mapped, lazy-loaded if heavy
- [ ] §7 verification run: viewport matrix + stress content + overlays + both themes + zoom — all pass
- [ ] §7.3 grep audit clean
- [ ] `npm run typecheck && npm run lint && npm run build` clean

---

## Sources

- [Tailwind CSS — Theme variables (`@theme`)](https://tailwindcss.com/docs/theme)
- [Tailwind CSS — Responsive design (mobile-first)](https://tailwindcss.com/docs/responsive-design)
- [shadcn/ui — Theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui — Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [Design Tokens That Scale (Tailwind v4 + CSS Variables)](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026/)
- [Component-First Responsive Design — Container Queries in Tailwind v4](https://kickstage.com/blog/component-first-responsive-design-container-queries-tailwind-v4)
- [shadcn/ui — Customization best practices discussion](https://github.com/shadcn-ui/ui/discussions/9754)