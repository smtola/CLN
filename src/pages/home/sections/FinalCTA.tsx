import { Link } from 'react-router-dom';
import QuoteCTA from '../../../components/ui/QuoteCTA';

export default function FinalCTA() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-cln-navy py-section text-white">
      <img src="/assets/image/bg_head.webp" alt="" loading="lazy" width={1920} height={1080} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cln-navy via-cln-navy/80 to-transparent" />
      <div data-reveal className="cln-shell">
        <h2 id="cta-title" className="max-w-4xl font-display text-display font-extrabold uppercase">
        CLN move your cargo <span className="text-cln-red">forward.</span>
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <QuoteCTA />
          <Link to="/contact-us" data-magnetic className="cln-btn-ghost">Contact Our Team</Link>
        </div>
      </div>
    </section>
  );
}
