# CLN Cambodia design system (Phase 2)

**Colors** (`tailwind.config.js` → `cln.*`): red `#EE3A23` (CTAs, accent words), green `#4FB748` (eyebrows, secondary), charcoal `#151719`, navy `#4F9748`, mist `#F4F5F6`, gray `#6B7280`. Logo stays `/logo.png`.
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

**Performance (Phase 6)**: all routes in `App.tsx` are `React.lazy` + one `<Suspense>` fallback; Home (and its GSAP chunk) loads only on `/`. Vendor chunks: `react`, `gsap`; AWS SDK and charts stay inside the lazy admin/price chunks.

**SEO & performance (Phase 6)**
- Homepage images are WebP siblings of the originals in `public/assets/image/` (originals kept for other pages): ~15.3 MB → ~1.5 MB. Regenerate with Pillow at max 1000px wide (poster 1100px), quality 78.
- Fonts: Inter/Manrope/Noto Sans Khmer and the secondary families (Playwrite NZ, Space Grotesk, IBM Plex Mono) load non-blocking from `index.html` (`media="print"` swap); no `@import` in CSS.
- LCP: on `/` the hero image is preloaded and the Home chunk starts downloading immediately (inline script in `index.html`, `importHome()` in `App.tsx`).
- Contrast: `.cln-eyebrow` uses `cln-green-dark` (5.0:1 on white); use `!text-white/90` or `!text-cln-green` on dark sections. Stats band uses `cln-green-dark` (white text 5.0:1).
- `robots.txt` blocks `/admin/`, `/auth/`, `/price/`; sitemap lists the 5 public pages once each.
