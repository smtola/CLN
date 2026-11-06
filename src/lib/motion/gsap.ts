// Single registered GSAP instance. Import from here, never from 'gsap' directly,
// so ScrollTrigger is always registered exactly once.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };
