import { useLayoutEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger } from '../../lib/motion/gsap';

/**
 * All homepage scroll animation lives here, scoped to <main>.
 * - Content is fully visible with CSS only; this hook only enhances it.
 * - prefers-reduced-motion: nothing animates (only the native progress bar below runs).
 * - Under 1024px: no pinning, smaller offsets, no scale scrubbing.
 */
export function useHomeAnimations(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    mm.add(
      { mobile: '(max-width: 1023px)', desktop: '(min-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const { desktop, reduce } = (ctx.conditions ?? {}) as Record<string, boolean>;
        const cleanups: Array<() => void> = [];
        const q = <T extends Element>(sel: string) => gsap.utils.toArray<T>(sel, root);

        // ── Ecosystem progress: native swipe (mobile) or reduced motion ──
        const ecoList = root.querySelector<HTMLElement>('[data-eco-list]');
        const ecoBar = root.querySelector<HTMLElement>('[data-eco-progress]');
        if (ecoList && ecoBar && (!desktop || reduce)) {
          const onScroll = () => {
            const max = ecoList.scrollWidth - ecoList.clientWidth;
            gsap.set(ecoBar, { scaleX: max > 0 ? ecoList.scrollLeft / max : 0 });
          };
          ecoList.addEventListener('scroll', onScroll, { passive: true });
          cleanups.push(() => ecoList.removeEventListener('scroll', onScroll));
        }

        if (reduce) return () => cleanups.forEach((fn) => fn());

        // ── Hero: staggered word entrance from alternating directions ──
        const spread = desktop ? 90 : 36;
        gsap.from('#hero-title [data-word]', {
          opacity: 0,
          x: (i: number) => (i % 2 ? spread : -spread),
          y: (i: number) => (i % 2 ? 40 : -40),
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.12,
        });
        gsap.from('[data-hero-fade]', { opacity: 0, y: 24, duration: 0.9, delay: 0.5, stagger: 0.12, ease: 'power3.out' });

        // Hero headline scales down and fades as the user scrolls away (desktop only)
        if (desktop) {
          gsap.to('#hero-title', {
            scale: 0.72, opacity: 0.25, y: -60, transformOrigin: 'left bottom', ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
          });
        }

        // Background parallax (image is overscanned so edges never show)
        q<HTMLElement>('[data-parallax]').forEach((img) => {
          gsap.set(img, { scale: 1.2 });
          gsap.to(img, {
            yPercent: desktop ? 9 : 5, ease: 'none',
            scrollTrigger: { trigger: img.parentElement, start: 'top top', end: 'bottom top', scrub: true },
          });
        });
        q('[data-route]').forEach((path, i) => {
          gsap.to(path, {
            xPercent: (i % 2 ? 1 : -1) * (desktop ? 8 : 3), ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
          });
        });

        // ── Movement in Motion: words travel in, accent turns CLN Red, section pins on desktop ──
        const words = q<HTMLElement>('#movement [data-word]');
        const accents = words.filter((w) => w.classList.contains('text-cln-red'));
        const move = gsap.timeline({
          scrollTrigger: {
            trigger: '#movement',
            start: desktop ? 'top top' : 'top 75%',
            end: desktop ? '+=120%' : 'bottom 55%',
            scrub: 0.6, pin: desktop, anticipatePin: 1,
          },
        });
        move
          .from(words, {
            opacity: 0.12, x: (i: number) => (i % 2 ? 1 : -1) * (desktop ? 120 : 36),
            y: (i: number) => (i % 3 === 0 ? -40 : 40), stagger: 0.12, ease: 'none',
          })
          .fromTo('#movement h2', { scale: desktop ? 1.12 : 1 }, { scale: 1, ease: 'none' }, 0)
          .fromTo(accents, { color: '#ffffff' }, { color: '#EE3A23', ease: 'none' }, '>-0.3')
          .from('[data-movement-copy]', { opacity: 0, y: 30, ease: 'none' }, '>-0.1');

        // ── Network map: routes draw in, nodes pop ──
        q<SVGPathElement>('#network [data-route-path]').forEach((path) => {
          const len = path.getTotalLength();
          gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, {
            strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut',
            scrollTrigger: { trigger: '#network', start: 'top 65%', once: true },
            onComplete: () => { gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' }); },
          });
        });
        gsap.from('#network [data-node]', {
          scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)', stagger: 0.15,
          scrollTrigger: { trigger: '#network', start: 'top 60%', once: true },
        });

        // ── Count-up (numeric values only; "24/7" is left as is) ──
        q<HTMLElement>('[data-count]').forEach((el) => {
          const original = el.textContent ?? '';
          const m = original.trim().match(/^(\d+)(\+?)$/);
          if (!m) return;
          const target = Number(m[1]);
          const suffix = m[2];
          const o = { v: 0 };
          el.textContent = `0${suffix}`;
          ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true,
            onEnter: () => gsap.to(o, { v: target, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = `${Math.round(o.v)}${suffix}`; } }),
          });
          cleanups.push(() => { el.textContent = original; });
        });

        // ── Ecosystem: pinned horizontal story (desktop) ──
        if (desktop && ecoList && ecoBar) {
          const items = q<HTMLElement>('[data-eco-list] > li');
          const last = items[items.length - 1];
          const dist = () => Math.max(0, last.offsetLeft + last.offsetWidth + parseFloat(getComputedStyle(ecoList).paddingLeft) - ecoList.clientWidth);
          gsap.set(ecoList, { overflowX: 'hidden', scrollSnapType: 'none' });
          gsap.to(items, {
            x: () => -dist(), ease: 'none',
            scrollTrigger: {
              trigger: '#ecosystem', start: 'top top', end: () => `+=${dist()}`,
              scrub: true, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
              onUpdate: (self) => { gsap.set(ecoBar, { scaleX: self.progress }); },
            },
          });
        }

        // ── Scroll reveals ──
        const reveals = q<HTMLElement>('[data-reveal]');
        gsap.set(reveals, { opacity: 0, y: 40 });
        ScrollTrigger.batch(reveals, {
          start: 'top 88%', once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true }),
        });
        q<HTMLElement>('[data-clip]').forEach((el) => {
          gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          });
        });
        q<HTMLElement>('[data-icon]').forEach((el) => {
          gsap.from(el, {
            scale: 0.5, rotate: -20, opacity: 0, duration: 0.8, ease: 'back.out(2)',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          });
        });

        // ── Magnetic buttons (fine pointers only) ──
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          q<HTMLElement>('[data-magnetic]').forEach((el) => {
            const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
            const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
            const onMove = (e: MouseEvent) => {
              const r = el.getBoundingClientRect();
              xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
              yTo((e.clientY - (r.top + r.height / 2)) * 0.25);
            };
            const onLeave = () => { xTo(0); yTo(0); };
            el.addEventListener('mousemove', onMove);
            el.addEventListener('mouseleave', onLeave);
            cleanups.push(() => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); });
          });
        }

        return () => cleanups.forEach((fn) => fn());
      },
    );

    // Lazy images and webfonts shift layout; recompute trigger positions once they settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      window.removeEventListener('load', refresh);
      mm.revert();
    };
  }, [rootRef]);
}
