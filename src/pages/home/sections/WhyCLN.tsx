import { Award, ShieldCheck, Globe, Headset } from 'lucide-react';
import { pillars } from '../data';

const icons = [Award, ShieldCheck, Globe, Headset];

export default function WhyCLN() {
  return (
    <section aria-labelledby="why-title" className="bg-cln-mist py-section">
      <div className="cln-shell grid items-center gap-12 lg:grid-cols-[1fr_2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="cln-eyebrow !text-[#2e7d32]">Why choose CLN</p>
          <h2
            id="why-title"
            data-reveal
            className="mt-4 font-display text-headline font-extrabold leading-[1.05] text-cln-charcoal"
          >
            Built on trust, <span className="text-cln-red">in motion.</span>
          </h2>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p, i) => {
            const Icon = icons[i];
            const featured = i === 0;

            if (featured) {
              return (
                <li
                  key={p.title}
                  data-reveal
                  className="rounded-[2rem] bg-[#2e7d32] p-8 text-white"
                >
                  <div className="flex items-center gap-3">
                    <Icon data-icon aria-hidden="true" className="h-7 w-7 text-white" />
                    <span className="font-display text-6xl font-extrabold leading-none">30+</span>
                    <span className="self-end pb-1 text-sm font-bold uppercase tracking-[0.2em]">
                      Years
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-extrabold uppercase text-white">
                    {p.title}
                  </h3>
                  <p className="mt-3 font-semibold leading-relaxed text-white/95">{p.text}</p>
                </li>
              );
            }

            return (
              <li
                key={p.title}
                data-reveal
                className="rounded-[2rem] bg-white p-8 transition-shadow duration-300 hover:shadow-xl"
              >
                <Icon data-icon aria-hidden="true" className="h-8 w-8 text-cln-red" />
                <h3 className="mt-6 font-display text-2xl font-extrabold uppercase text-cln-charcoal">
                  {p.title}
                </h3>
                <p className="mt-3 leading-relaxed text-cln-gray">{p.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}