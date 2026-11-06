# CLN Cambodia design system (Phase 2)

**Colors** (`tailwind.config.js` → `cln.*`): red `#EE3A23` (CTAs, accent words), green `#4FB748` (eyebrows, secondary), charcoal `#151719`, navy `#101B2A`, mist `#F4F5F6`, gray `#6B7280`. Logo stays `/logo.png`.
Contrast: white on red passes for large/bold text only; use `cln-red-dark` for small white-on-red text. Gray `#6B7280` on white passes AA for body text.

**Type**: Manrope (`font-display`) for headlines, Inter (`font-body`) for text, Noto Sans Khmer as fallback in both stacks.
Scale: `text-hero` clamp(3rem,9vw,9rem) · `text-display` · `text-headline` · `text-lead`.

**Layout**: `.cln-shell` (max 1440px, fluid gutter) · `.cln-section` (fluid vertical rhythm) · breakpoints: mobile <768, tablet 768, laptop 1024, desktop 1440 (+ existing xs/xss/smx).

**Components**: `.cln-btn`, `.cln-btn-primary`, `.cln-btn-ghost`, `.cln-eyebrow`, `<SplitWords>` (word-level scroll typography).

**Motion rules**
1. GSAP + ScrollTrigger only, imported from `src/lib/motion/gsap.ts` inside `useHomeAnimations` (Home only; Home becomes a lazy route in Phase 6). No second animation library.
2. Every animation checks `usePrefersReducedMotion()` and jumps to its end state.
3. Content is fully visible with animation off; animation only enhances.
4. Magnetic buttons / custom cursor only when `useFinePointer()`.
5. Animate `transform` and `opacity` only. Reduced complexity under 768px. Never hijack vertical scroll on touch (horizontal story section becomes native swipe).
6. Easing `cubic-bezier(0.16,1,0.3,1)` (`ease-out-expo`), durations 0.6–1.2s.

**Homepage architecture** (`src/pages/home/sections/`): Hero · MovementInMotion · GlobalNetwork · Services · Stats · Ecosystem · About · WhyCLN · Partners · FinalCTA, then shared Footer.
Data: services from existing API with the current hardcoded list as fallback; stats only values already in the code (30+ years, 9 services; "20+ clients" and "24/7" pending confirmation).
