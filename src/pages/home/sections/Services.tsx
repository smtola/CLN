import { Link } from 'react-router-dom';
import { services } from '../data';

export default function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="bg-cln-mist py-section">
      <div className="cln-shell">
        <p data-reveal className="cln-eyebrow">Our services</p>
        <h2 id="services-title" data-reveal className="mt-4 max-w-3xl font-display text-headline font-extrabold text-cln-charcoal">
          Everything your cargo needs, from one team.
        </h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.key} data-reveal>
              <Link to={s.to} data-cursor="VIEW SERVICE" className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-cln-navy text-white">
                <img src={encodeURI(s.image)} alt="" loading="lazy" width={800} height={600}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105 group-focus-visible:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-xl font-bold transition-transform duration-500 ease-out-expo lg:group-hover:-translate-y-1">{s.title}</h3>
                  {/* Visible by default on touch/small screens; revealed on hover/focus on desktop */}
                  <p className="mt-1 text-sm text-white/80 transition-all duration-500 lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-16 lg:group-hover:opacity-100 lg:group-focus-visible:max-h-16 lg:group-focus-visible:opacity-100">{s.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
                    Explore Service <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
                <span aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-cln-red transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
