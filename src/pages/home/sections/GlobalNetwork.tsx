import { useState } from 'react';
import { routes, type Mode } from '../data';

const HUB = { x: 300, y: 220 };
const COLORS: Record<Mode, string> = { land: '#4FB748', sea: '#6FA8FF', air: '#EE3A23' };
const point = (angle: number, r: number) => ({
  x: HUB.x + r * Math.cos((angle * Math.PI) / 180),
  y: HUB.y + r * Math.sin((angle * Math.PI) / 180),
});

export default function GlobalNetwork() {
  const [filter, setFilter] = useState<Mode | 'all'>('all');
  const [active, setActive] = useState<Mode>('sea');
  const visible = routes.filter((r) => filter === 'all' || r.mode === filter);
  const current = routes.find((r) => r.mode === active)!;

  return (
    <section id="network" aria-labelledby="network-title" className="bg-white py-section">
      <div className="cln-shell grid items-center gap-12 lg:grid-cols-2">
        <div data-reveal>
          <p className="cln-eyebrow">Global logistics network</p>
          <h2 id="network-title" className="mt-4 font-display text-headline font-extrabold text-cln-charcoal">
            Global logistics. <span className="text-cln-red">Local expertise.</span>
          </h2>
          <p className="mt-4 font-body text-lead text-cln-gray">
            Land, sea and air services connected from our Phnom Penh office.
          </p>

          <div role="group" aria-label="Filter by transport mode" className="mt-8 flex flex-wrap gap-2">
            {(['all', 'land', 'sea', 'air'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={filter === m} onClick={() => setFilter(m)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold capitalize transition-colors ${filter === m ? 'border-cln-charcoal bg-cln-charcoal text-white' : 'border-gray-300 text-cln-charcoal hover:border-cln-charcoal'}`}>
                {m}
              </button>
            ))}
          </div>

          <ul className="mt-6 space-y-2">
            {visible.map((r) => (
              <li key={r.mode}>
                <button type="button" onClick={() => setActive(r.mode)} aria-pressed={active === r.mode}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${active === r.mode ? 'border-cln-red bg-cln-mist' : 'border-gray-200 hover:bg-cln-mist'}`}>
                  <span className="font-display font-bold text-cln-charcoal">{r.title}</span>
                  <span className="text-cln-gray"> · Phnom Penh → {r.to}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 min-h-[3rem] font-body text-cln-charcoal" aria-live="polite">{current.text}</p>
          <p className="mt-2 text-xs text-cln-gray">Illustration of logistics connectivity. Not live shipment tracking.</p>
        </div>

        <svg viewBox="0 0 600 440" role="img" aria-label="Diagram of land, sea and air routes from Phnom Penh" className="h-auto w-full rounded-3xl bg-cln-navy">
          {[1, 2, 3].map((i) => <circle key={i} cx={HUB.x} cy={HUB.y} r={i * 70} fill="none" stroke="#ffffff" strokeOpacity="0.08" />)}
          {routes.map((r) => {
            const end = point(r.angle, 190);
            const show = filter === 'all' || filter === r.mode;
            return (
              <g key={r.mode} opacity={show ? 1 : 0.12}>
                <path data-route-path d={`M${HUB.x} ${HUB.y} Q ${(HUB.x + end.x) / 2} ${(HUB.y + end.y) / 2 - 40} ${end.x} ${end.y}`} fill="none" stroke={COLORS[r.mode]} strokeWidth={active === r.mode ? 3 : 1.5} strokeDasharray="6 8" />
                <circle data-node cx={end.x} cy={end.y} r={active === r.mode ? 9 : 6} fill={COLORS[r.mode]} />
                <text x={end.x} y={end.y + 26} textAnchor="middle" fill="#fff" fontSize="13" fontFamily="Inter, sans-serif">{r.title}</text>
              </g>
            );
          })}
          <circle data-node cx={HUB.x} cy={HUB.y} r="12" fill="#EE3A23" />
          <circle cx={HUB.x} cy={HUB.y} r="22" fill="none" stroke="#EE3A23" strokeOpacity="0.4" />
          <text x={HUB.x} y={HUB.y + 44} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Manrope, sans-serif">Phnom Penh</text>
        </svg>
      </div>
    </section>
  );
}
