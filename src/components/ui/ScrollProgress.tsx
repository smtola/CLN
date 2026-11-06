import { useEffect, useRef } from 'react';

/** Fixed top progress line. Plain rAF + transform, no animation library needed. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, d.scrollTop / max) : 0})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-cln-red" style={{ transform: 'scaleX(0)' }} />;
}
