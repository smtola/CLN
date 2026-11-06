import { useEffect, useState } from 'react';

const query = (q: string) => (typeof window !== 'undefined' ? window.matchMedia(q) : null);

/** True when the visitor asked for reduced motion. Animations must skip to their end state. */
export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(() => !!query('(prefers-reduced-motion: reduce)')?.matches);
  useEffect(() => {
    const mq = query('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
};

/** True for fine-pointer, hover-capable devices (magnetic buttons, custom cursor are desktop-only). */
export const useFinePointer = (): boolean => {
  const [fine, setFine] = useState(() => !!query('(hover: hover) and (pointer: fine)')?.matches);
  useEffect(() => {
    const mq = query('(hover: hover) and (pointer: fine)');
    if (!mq) return;
    const on = () => setFine(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return fine;
};
