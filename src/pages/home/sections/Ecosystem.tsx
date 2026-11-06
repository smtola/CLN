import { ecosystem } from '../data';

/**
 * Native horizontal scroll-snap by default (touch swipe, no scroll hijacking).
 * On desktop with motion allowed, useHomeAnimations pins the section and drives the row with vertical scroll.
 */
export default function Ecosystem() {
  return (
    <section id="ecosystem" aria-labelledby="eco-title" className="bg-cln-charcoal py-section text-white">
      <div className="cln-shell">
        <p data-reveal className="cln-eyebrow !text-cln-green">Transportation ecosystem</p>
        <h2 id="eco-title" data-reveal className="mt-4 font-display text-headline font-extrabold">Move beyond. Connect everywhere.</h2>
      </div>
      <ul data-eco-list className="relative mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-6" tabIndex={0} aria-label="Transportation categories, scroll horizontally">
        {ecosystem.map((e) => (
          <li key={e.id} data-cursor="DISCOVER" className="relative aspect-[4/5] w-[82vw] shrink-0 snap-center overflow-hidden rounded-3xl sm:aspect-[4/3] sm:w-[58vw] lg:w-[42vw]">
            <img src={e.image} alt={e.alt} loading="lazy" width={1200} height={900} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 p-6 sm:p-8">
              <h3 className="font-display text-display font-extrabold leading-none">{e.title}</h3>
              <p className="mt-2 text-white/80">{e.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="cln-shell mt-4" aria-hidden="true">
        <div className="h-0.5 w-full bg-white/20">
          <div data-eco-progress className="h-full origin-left bg-cln-red" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  );
}
