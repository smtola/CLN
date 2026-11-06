import { partners } from '../data';

export default function Partners() {
  return (
    <section aria-labelledby="partners-title" className="bg-white py-section">
      <div data-reveal className="cln-shell text-center">
        <p className="cln-eyebrow">Partners &amp; network</p>
        <h2 id="partners-title" className="mt-4 font-display text-headline font-extrabold text-cln-charcoal">Network Membership</h2>
        <ul className="mt-12 flex flex-wrap items-center justify-center gap-10">
          {partners.map((p) => (
            <li key={p.name}>
              <img src={p.logo} alt={p.name} loading="lazy" width={160} height={160} className="h-32 w-32 object-contain  transition duration-500  md:h-40 md:w-40" tabIndex={0} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
