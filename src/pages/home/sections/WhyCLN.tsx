import { Award, ShieldCheck, Globe, Headset } from 'lucide-react';
import { pillars } from '../data';

const icons = [Award, ShieldCheck, Globe, Headset];

export default function WhyCLN() {
  return (
    <section aria-labelledby="why-title" className="bg-cln-mist py-section">
      <div className="cln-shell grid gap-12 lg:grid-cols-[1fr_2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="cln-eyebrow">Why choose CLN</p>
          <h2 id="why-title" data-reveal className="mt-4 font-display text-headline font-extrabold text-cln-charcoal">Built on trust, <span className="text-cln-red">in motion.</span></h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p, i) => {
            const Icon = icons[i];
            return (
              <li key={p.title} data-reveal className="rounded-3xl bg-white p-8 transition-shadow duration-300 hover:shadow-xl">
                <Icon data-icon aria-hidden="true" className="h-8 w-8 text-cln-red" />
                <h3 className="mt-6 font-display text-xl font-bold uppercase tracking-wide text-cln-charcoal">{p.title}</h3>
                <p className="mt-2 text-cln-gray">{p.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
