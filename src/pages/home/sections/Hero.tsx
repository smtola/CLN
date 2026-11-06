import { Link } from 'react-router-dom';
import QuoteCTA from '../../../components/ui/QuoteCTA';
import SplitWords from '../../../components/ui/SplitWords';

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative isolate flex min-h-[calc(100svh-110px)] items-end overflow-hidden bg-cln-navy text-white">
      <img src="/assets/image/bg_head.webp" alt="" width={1920} height={1080} {...{ fetchpriority: 'high' }} className="absolute inset-0 -z-20 h-full w-full object-cover" data-parallax />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-cln-navy via-cln-navy/70 to-cln-navy/30" />
      {/* Decorative route lines */}
      <svg aria-hidden="true" className="absolute inset-x-0 top-[12%] -z-10 h-1/2 w-full opacity-60" viewBox="0 0 1440 400" preserveAspectRatio="none" fill="none">
        <path data-route d="M-20 320 C 300 40, 700 380, 1000 140 S 1380 80, 1460 60" stroke="#EE3A23" strokeWidth="2" strokeDasharray="6 10" />
        <path data-route d="M-20 380 C 400 200, 800 300, 1460 180" stroke="#4FB748" strokeWidth="2" strokeDasharray="6 10" />
      </svg>

      <div className="cln-shell pb-section pt-32">
        <p data-hero-fade className="cln-eyebrow !text-white/80">Cambodia’s Trusted Logistics Partner</p>
        <SplitWords as="h1" id="hero-title" text="CLN CAMBODIA LOGISTICS" accent={['CLN']} className="mt-4 block font-display text-hero font-extrabold uppercase" />
        <p data-hero-fade className="mt-6 max-w-xl font-body text-lead text-white/85">
          ALL THE POSSIBLE MOVES.        </p>
        <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
          <Link to="/services" className="cln-btn-primary" data-magnetic data-cursor="EXPLORE">Explore Our Services <span aria-hidden="true">→</span></Link>
          <QuoteCTA className="cln-btn-ghost" />
        </div>
        <a data-hero-fade href="#movement" className="mt-12 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-white">
          <span aria-hidden="true" className="h-10 w-px bg-white/60" /> Scroll
        </a>
      </div>
    </section>
  );
}
