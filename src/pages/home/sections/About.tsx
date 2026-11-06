import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-white py-section">
      <div className="cln-shell grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <img data-clip src="/assets/image/export_poster.png" alt="CLN Cambodia office" loading="lazy" width={1200} height={900} className="aspect-[4/3] w-full rounded-3xl object-cover" />
        </div>
        <div data-reveal>
          <p className="cln-eyebrow">About CLN</p>
          <h2 id="about-title" className="mt-4 font-display text-headline font-extrabold text-cln-charcoal">
            Over 30 years in import and export logistics.
          </h2>
          <p className="mt-6 font-body text-lead text-cln-gray">
            CLN Cambodia Logistics is a registered company established in Cambodia since 2015, with an office in Phnom Penh. We collaborate with many shipping companies both locally and overseas and, together with advanced information technology, offer international and domestic logistics services and networks that enable our customers to make “All the Possible Moves” in their supply chains.
          </p>
          <Link to="/about-us" data-magnetic data-cursor="EXPLORE" className="cln-btn-primary mt-8">Read More <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
