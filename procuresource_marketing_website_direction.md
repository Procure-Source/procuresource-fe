# ProcureSource Marketing Website — UX / UI Redesign Direction

## 0. Purpose

This document is the design and implementation direction for the ProcureSource marketing website.

It is intended to be handed to an AI coding agent before implementation.

The objective is **not** to make the website "more animated" for its own sake.

The objective is to create a premium, credible, product-led B2B website that makes a procurement manager understand:

1. what ProcureSource is,
2. what problem it solves,
3. how the workflow changes,
4. why the product is relevant to UAE MEP procurement teams, and
5. how to request access.

The site should feel **precise, operational, modern, restrained, and trustworthy**.

The central visual idea is:

> **Fragmented procurement information → structured RFQ → supplier responses → comparable procurement record.**

Animation is used to explain this transformation.

---

# 1. Design North Star

## The desired feeling

The website should communicate:

- precision
- operational maturity
- enterprise trust
- modern software
- procurement expertise
- quiet confidence
- technical competence

It should **not** feel like:

- a consumer fintech app
- a crypto landing page
- a generic AI startup
- a flashy Web3 website
- a template-heavy SaaS site
- a generic construction company
- an "AI magic" website

The visual language should communicate:

> "These people understand procurement systems."

rather than:

> "These people know how to make a flashy website."

---

# 2. Core Visual Metaphor

ProcureSource's strongest marketing visual is not a stock photograph.

It is the **movement and transformation of procurement data**.

The website should repeatedly use a visual vocabulary built from:

- BOQ line items
- RFQs
- supplier nodes
- quotation cards
- prices
- quantities
- lead times
- statuses
- comparison tables
- structured rows
- connection lines
- package/group relationships
- subtle geographic/network references

The visual system should feel like a procurement operating layer.

Avoid generic hero imagery such as:

- Dubai skyline photographs
- construction workers
- warehouses
- handshakes
- generic business meetings
- stock laptops
- generic "AI" graphics

If imagery is used, it should support the procurement narrative rather than decorate it.

---

# 3. Homepage Narrative

The homepage should tell one coherent story.

Recommended order:

1. Navigation
2. Hero
3. Procurement problem
4. Interactive "How it works"
5. Product/value visualization
6. UAE / MEP positioning
7. Private launch
8. FAQ
9. Request-access CTA
10. Footer

The narrative should progressively move from:

**problem → transformation → product → credibility → action**

---

# 4. Navigation

Keep navigation extremely simple.

Suggested structure:

- ProcureSource
- How it works
- About / Why ProcureSource
- FAQ

Primary CTA:

**Request early access**

The CTA should remain visually consistent throughout the page.

Do not use multiple competing CTA labels such as:

- Join launch list
- Send a note
- Request access
- Get started
- Contact us

Choose one primary action.

Recommended:

> **Request early access**

Secondary action:

> **See how it works**

---

# 5. Hero

## Objective

The hero must immediately communicate:

- what ProcureSource does,
- who it is for,
- that the product is currently private,
- and what the visitor should do next.

Do not make the hero purely typographic.

Introduce a restrained procurement visualization.

### Concept

Left side:

- strong headline
- concise value proposition
- CTA
- private-launch indicator

Right side:

A living abstract RFQ/product visualization.

Example visual structure:

```text
                    RFQ-0248

       ┌──────────────────────────────┐
       │ HVAC Package                 │
       │                              │
       │ 27 line items                │
       │ 6 suppliers invited          │
       │                              │
       │        ●───────●             │
       │       /         \            │
       │      ●           ●           │
       │       \         /            │
       │        ────────              │
       │                              │
       │ 4 quotations received        │
       └──────────────────────────────┘
```

This should be abstracted enough that it is clearly a marketing visualization rather than a screenshot of the production application.

### Hero motion

Use subtle movement:

- cards entering
- lines drawing
- values updating
- status transitions
- slight parallax
- controlled opacity changes

Do not create a constantly moving dashboard.

The hero should still look excellent when completely static.

---

# 6. Problem Section

Introduce the procurement problem before explaining the product.

Potential concept:

## Procurement gets fragmented long before the decision gets difficult.

Visualize the fragmented workflow:

```text
BOQ.xlsx
   ↓
Email
   ↓
RFQ
   ↓
Supplier PDF
   ↓
Excel quotation
   ↓
WhatsApp
   ↓
Revised quotation
   ↓
Manual comparison
```

The visual should progressively become more chaotic.

Then transition into:

> **ProcureSource brings the procurement record back together.**

The fragmented objects reorganize into a single structured system.

This section should establish the problem visually rather than using a large paragraph.

---

# 7. The Main "How It Works" Experience

This is the most important interactive section on the website.

Do NOT implement it as four static cards.

The visitor should watch one procurement workflow transform.

## Four states

Use user-facing terminology:

### 01 — Structure

Turn the BOQ into a structured RFQ.

### 02 — Invite

Send the RFQ to the relevant suppliers.

### 03 — Collect

Bring supplier quotations into one workflow.

### 04 — Compare

Normalize responses and compare the commercial picture.

Internally, implementation may use:

```text
INPUT
DISTRIBUTE
INGEST
RECONCILE
```

but these should not necessarily be the customer-facing labels.

---

# 8. Critical Rule: Data Continuity

The four states must not look like four unrelated animations.

The **same data must persist across the states**.

Example initial BOQ:

```text
BOQ

AHU 20,000 CFM       4 units
Cable Tray 300mm     120 m
Copper Pipe 50mm     240 m
```

Then the same data becomes:

```text
RFQ-0248

3 suppliers invited
```

Then supplier quotations arrive:

```text
SUPPLIER A     AED 184,200
SUPPLIER B     AED 176,850
SUPPLIER C     AED 191,400
```

Then the same line items become comparable:

```text
                         A           B           C

AHU                  42,000       40,500      44,200
Cable Tray            18,400       17,900      19,200
Copper Pipe           23,100       22,800      24,100
```

The user should subconsciously understand:

> "The information I entered at the beginning is what I am comparing at the end."

This is much stronger than four decorative scenes.

---

# 9. Desktop Interaction

Desktop should use scroll-driven storytelling.

Recommended behavior:

- visual stage becomes pinned while the section is active,
- scrolling progresses through the four states,
- state transitions are smooth,
- progress indicator communicates position,
- text and visual state remain synchronized,
- the page eventually releases the pinned section and continues normally.

Do not arbitrarily force a 200vh or 300vh section.

The height should be determined by the amount of interaction required.

The user must always feel that normal scrolling is still working.

---

# 10. Tablet Interaction

Tablet should reduce the amount of pinning.

Possible behavior:

- shorter scroll sequence,
- less simultaneous information,
- larger visual elements,
- same four states,
- simplified transitions.

Do not simply shrink the desktop experience.

---

# 11. Mobile Interaction

Do NOT use a pinned 200vh scrollytelling experience on mobile.

Use normal vertical flow.

Recommended structure:

```text
01 Structure
[visual]

02 Invite
[visual]

03 Collect
[visual]

04 Compare
[visual]
```

Each state can use:

- tap-to-reveal,
- scroll-triggered reveal,
- simple state transition,
- compact animated cards.

Avoid requiring horizontal scrolling to understand the story.

The narrative must remain identical even though the interaction changes.

Principle:

> **Animation adapts to the device; the narrative does not.**

---

# 12. Cognitive Load Rules

The simulated procurement data should be intentionally sparse.

Use approximately 3–4 line items.

Recommended examples:

- AHU 20,000 CFM
- Cable Tray 300mm
- Copper Pipe 50mm
- Isolation Valve

Do not create fake dense BOQ tables containing dozens of rows.

Users will not read them.

The visualization should emphasize:

- price
- quantity
- lead time
- supplier count
- line-item matching
- comparison

Everything else is secondary.

Rule:

> **Animation explains relationships. Text explains meaning.**

---

# 13. Enterprise Trust / Visual Language

Use strict visual geometry.

### Layout

- strong grid
- consistent column alignment
- generous whitespace
- thin borders
- restrained corner radius
- clear hierarchy
- controlled density

Avoid excessive floating cards.

Not every piece of content needs a rounded rectangle.

### Typography

Use a high-quality sans-serif for normal content.

Use monospace selectively for:

- RFQ IDs
- SKU/CID-like identifiers
- quantities
- financial values
- percentages
- statuses
- timestamps

Do not make the entire website monospace.

### Numbers

Numbers should visually feel authoritative.

For example:

```text
AED 176,850
15 days
94%
27 items
6 suppliers
```

Use consistent tabular alignment.

---

# 14. Motion System

Motion should be **functional**, not decorative.

Good motion:

- opacity transitions
- translateY / translateX
- SVG line drawing
- number interpolation
- card reordering
- table row matching
- state transitions
- subtle parallax
- hover states
- progress indicators

Avoid:

- bouncing cards
- elastic UI
- spinning dashboards
- excessive particles
- constant background movement
- gratuitous 3D
- giant animated gradients
- excessive glassmorphism

### Timing

Use restrained durations.

Typical ranges:

- microinteraction: 150–250ms
- component transition: 250–450ms
- major state transition: 400–700ms

Do not make the visitor wait for an animation before accessing content.

---

# 15. Animation Performance

Implementation should prioritize performance.

Rules:

- Prefer CSS transforms and opacity.
- Avoid continuous animation of layout properties such as `width`, `height`, `top`, and `left`.
- Avoid unnecessary React state updates on every scroll event.
- Use a performant scroll observer / motion mechanism.
- Keep expensive rendering outside the React render path where appropriate.
- Lazy-load heavy assets.
- Avoid WebGL unless a real design requirement emerges.
- Do not introduce Three.js merely because the website needs to feel "premium".
- SVG/CSS/motion should be the default.

---

# 16. Accessibility

The website must remain usable without animation.

Implement:

```text
prefers-reduced-motion
```

When reduced motion is requested:

- disable major movement,
- avoid scroll-jacking,
- show state transitions immediately,
- preserve all content,
- preserve navigation,
- preserve CTA functionality.

No essential information may exist only inside an animation.

---

# 17. Product Accuracy

The marketing website must not invent ProcureSource functionality.

The interactive visualizations are illustrative representations of the product workflow.

Do not imply capabilities that have not been established.

For example, do not invent claims about:

- autonomous purchasing,
- guaranteed savings,
- automatic supplier selection,
- guaranteed quotation matching,
- real-time supplier availability,
- AI making procurement decisions,
- procurement outcomes that the product does not actually provide.

The marketing experience must be aspirational in presentation but conservative in product claims.

---

# 18. Product / Value Section

After the interactive workflow, introduce the actual value.

Potential themes:

### Structured procurement

Turn unstructured procurement inputs into a consistent workflow.

### Supplier coordination

Keep RFQs and supplier responses connected.

### Commercial comparison

Make supplier responses easier to compare.

### Procurement record

Keep the relevant information connected instead of scattered across documents and messages.

Do not overpopulate this section with feature cards.

Three or four strong concepts are preferable to twelve features.

---

# 19. UAE / MEP Positioning

ProcureSource should feel intentionally designed for its initial market.

The UAE identity should be present without resorting to generic Dubai imagery.

Use subtle regional cues:

- `DXB.UAE`
- regional network visualization
- MEP procurement terminology
- supplier/project relationships
- understated geographic references

Possible visual:

```text
                         DUBAI

                  ●──────●──────●
                 /               \
                ●                 ●
               /                   \
           PROJECT               SUPPLIER
               ●                   ●
                \                 /
                 ●──────●──────●
```

The message should be:

> **Built around the realities of regional procurement.**

not:

> **Here is a picture of Dubai.**

---

# 20. Private Launch Section

The existing private-launch positioning should remain.

This is a useful differentiator.

Instead of making it look like a generic email signup, make it feel deliberate.

Potential message:

> **ProcureSource is currently being introduced to a limited number of UAE procurement teams.**

Then:

**Request a live walkthrough**

The visual could show a partially revealed procurement system.

The feeling should be:

> selective early access

rather than:

> unfinished product.

Do not overstate scarcity.

---

# 21. CTA Strategy

Use one primary CTA throughout the site:

> **Request early access**

Secondary CTA:

> **See how it works**

Bottom CTA:

> **See ProcureSource on a live RFQ.**

The CTA should always be easy to find.

Do not use multiple competing calls to action.

---

# 22. Background Treatment

The site can remain relatively minimal.

The solution to the current blankness should not be "put an image behind every section."

Instead use layered visual texture:

- subtle grid
- extremely faint technical lines
- small data markers
- restrained radial gradients
- occasional network connections
- thin dividers
- subtle noise if appropriate

Background elements should usually sit below 5–10% visual prominence.

Content remains dominant.

---

# 23. Color Direction

Maintain a restrained palette.

Define semantic colors rather than arbitrary colors:

```text
background
foreground
muted
border
accent
success
warning
```

The accent should be meaningful.

For example:

- accent = active interaction
- success = matched / completed
- warning = attention / incomplete

Do not use colors merely because they look attractive.

If a color has semantic meaning in the product visualization, keep that meaning consistent across the site.

---

# 24. Component Architecture

Before implementation, inspect the existing codebase.

Do not replace the existing architecture without justification.

A likely structure:

```text
app/
  page.tsx

components/
  marketing/
    navigation/
    hero/
    problem/
    how-it-works/
      how-it-works.tsx
      procurement-stage.tsx
      boq-stage.tsx
      supplier-stage.tsx
      quotation-stage.tsx
      comparison-stage.tsx
    value/
    uae/
    private-launch/
    faq/
    access-cta/
    footer/
```

The exact structure should follow the existing repository conventions.

Do not duplicate design tokens or styling systems.

---

# 25. How the AI Coding Agent Should Work

The agent should NOT immediately start rewriting the homepage.

First:

### Step 1 — Inspect

Inspect:

- current page
- component hierarchy
- CSS/Tailwind configuration
- typography
- animation libraries
- existing design tokens
- responsive breakpoints
- existing CTA/form implementation
- SEO metadata
- accessibility behavior

### Step 2 — Report

Before implementation, report:

1. What exists.
2. What should be preserved.
3. What should be removed.
4. What should be refactored.
5. What new components are required.
6. What animation technology is already available.
7. What new dependencies, if any, are actually necessary.

### Step 3 — Implement structure

Build the homepage narrative and component boundaries first.

### Step 4 — Implement visual system

Apply:

- typography
- spacing
- grid
- borders
- colors
- responsive behavior

### Step 5 — Implement the interactive RFQ

Build the four-state visualization.

### Step 6 — Optimize

Check:

- desktop
- tablet
- mobile
- reduced motion
- keyboard navigation
- performance
- hydration behavior
- accessibility

### Step 7 — Final visual pass

Only after the structure works should additional polish be introduced.

---

# 26. Do Not Over-Engineer the First Version

The first implementation should NOT require:

- Three.js
- WebGL
- complex shaders
- video backgrounds
- large image libraries
- heavy animation frameworks if an existing library already handles the job

Prefer:

```text
Next.js
+ existing Tailwind setup
+ existing motion library
+ CSS
+ SVG
```

If the repository already has Framer Motion / Motion, use it rather than introducing another animation system.

---

# 27. Inspiration / Reference Websites

These references should be used for **patterns and principles**, not copied visually.

## Framer — Interactive Website Examples

urlFramer interactive website exampleshttps://www.framer.com/blog/interactive-websites/

Use this to study:

- interactive product previews
- scroll-driven storytelling
- microinteractions
- product visualization
- animation that explains rather than decorates

Framer's own guidance explicitly emphasizes that strong interactivity should solve a communication problem rather than merely add motion. citeturn0search0turn0search7

## Framer — Interactive Product / Narrative Experiences

urlFramer interactive experienceshttps://www.framer.com/solutions/builders/

Use this for inspiration around:

- interactive product demos
- narrative sites
- responsive motion
- live-data-style visualizations

These are particularly relevant to the ProcureSource "watch the workflow happen" concept. citeturn0search6

## Webflow — SaaS Design Examples

urlWebflow SaaS website exampleshttps://webflow.com/blog/saas-website-design-examples

Use this to study:

- SaaS information architecture
- product storytelling
- CTA placement
- product demos
- visual hierarchy
- trust-building sections

Webflow's current guidance specifically highlights clear value propositions, product demos, animated UI, social proof, and focused CTAs as important elements of SaaS marketing sites. citeturn0search4

## Webflow — Made in Webflow SaaS

urlMade in Webflow — SaaShttps://webflow.com/made-in-webflow/saas

Use this as an exploration library for:

- SaaS layouts
- animation
- interactions
- responsive compositions

It contains a large collection of community-built SaaS sites and can be filtered by animation/interactions. citeturn0search5

## Webflow — SaaS Landing Pages

urlMade in Webflow — SaaS landing pageshttps://webflow.com/made-in-webflow/saas%20landing%20page

Use this specifically for:

- landing-page composition
- hero patterns
- conversion sections
- interactive visual treatment

## Awwwards

urlAwwwardshttps://www.awwwards.com/

Use Awwwards selectively.

Study it for:

- interaction ideas
- visual composition
- transitions
- experimental layouts

Do NOT blindly copy Awwwards-style spectacle. ProcureSource needs more enterprise restraint.

---

# 28. Reference Selection Rules

When reviewing inspiration, categorize what is being borrowed.

### Good to borrow

- interaction pattern
- spacing
- typography hierarchy
- transition timing
- storytelling structure
- navigation behavior
- visual hierarchy

### Do not copy

- brand identity
- exact layout
- illustrations
- proprietary UI
- exact animation
- color palette
- marketing claims

The goal is to create a ProcureSource design system, not a collage of other websites.

---

# 29. Definition of Success

The redesign is successful if a procurement professional can visit the homepage and answer these questions within approximately 30–45 seconds:

### What is ProcureSource?

A procurement platform focused on the RFQ workflow.

### Who is it for?

UAE procurement teams, initially with a strong MEP focus.

### What does it change?

It brings BOQs, RFQs and supplier quotations into a more structured workflow.

### How does it work?

Structure → Invite → Collect → Compare.

### What should I do?

Request early access / a live walkthrough.

---

# 30. Final Design Principle

The website should not try to impress users by showing how much animation the developers can build.

It should impress users because the animation makes the procurement process suddenly obvious.

The core experience should communicate:

```text
FRAGMENTED
BOQ
PDF
EMAIL
EXCEL
WHATSAPP
     ↓
PROCURESOURCE
     ↓
STRUCTURED
RFQ
SUPPLIERS
QUOTATIONS
COMPARISON
     ↓
BETTER PROCUREMENT DECISION
```

The visual design should make this transformation feel inevitable, precise, and trustworthy.

That is the central design direction for the ProcureSource marketing site.
