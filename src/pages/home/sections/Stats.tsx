import { stats } from '../data';

export default function Stats() {
  return (
    <section aria-label="CLN Cambodia at a glance" className="bg-cln-green-dark py-14 text-white">
      <dl className="cln-shell grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse text-center">
            <dt className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">{s.label}</dt>
            <dd className="font-display text-display font-extrabold leading-none" data-count>{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
