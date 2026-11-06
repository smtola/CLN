import { useEffect, useRef, useState } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '../../lib/motion/useMotion';

/**
 * Optional desktop-only cursor follower with contextual labels (data-cursor="EXPLORE" etc).
 * The native cursor is never hidden and the element ignores pointer events, so it cannot block clicks.
 * The animation loop only runs while the follower is catching up to the pointer.
 */
export default function CustomCursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!fine || reduced || !el) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, shown = false;

    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { x = tx; y = ty; shown = true; el.style.opacity = '1'; }
      setLabel((e.target as Element | null)?.closest?.('[data-cursor]')?.getAttribute('data-cursor') ?? '');
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => { shown = false; el.style.opacity = '0'; };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ opacity: 0 }}
      className={`pointer-events-none fixed left-0 top-0 z-[90] flex items-center justify-center rounded-full bg-cln-red text-center text-[10px] font-bold uppercase leading-tight tracking-widest text-white transition-[width,height,opacity] duration-300 ${label ? 'h-20 w-20' : 'h-3 w-3'}`}
    >
      {label}
    </div>
  );
}
