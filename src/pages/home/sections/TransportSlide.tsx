import React, { useCallback, useEffect, useRef, useState } from "react";

type Mode = {
  id: string;
  label: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  color: string;
  sky: string; // page background behind the text
  lift: string; // distance of the vehicle from the bottom of the scene
};

type Layer = {
  mode: number; // index in MODES
  zone: "sky" | "ground";
  speed: number; // horizontal parallax in px across the whole scroll
  style: React.CSSProperties;
};

/* ---------- Content ---------- */
const MODES: Mode[] = [
  {
    id: "land",
    label: "Land",
    title: "Cross-border trucking",
    text: "Trucking from Phnom Penh to the Laos and Vietnam borders, covering Stung Treng, Ratanakiri, Kampot, Takeo, Kandal, Prey Veng, Svay Rieng, Tboung Khmum and Kratie.",
    image: "/assets/image/truck_1.png",
    alt: "CLN container truck",
    color: "#3F8238",
    sky: "linear-gradient(180deg,#dcedfb 0%,#f3f9f1 75%)",
    lift: "2rem",
  },
  {
    id: "sea",
    label: "Sea",
    title: "FCL and LCL by sea",
    text: "International container freight through Sihanoukville Autonomous Port (PAS) and Phnom Penh Autonomous Port in Kandal.",
    image: "/assets/image/ship_1.png",
    alt: "CLN container ship",
    color: "#7A5F0E",
    sky: "linear-gradient(180deg,#d6eaf8 0%,#eef7fc 70%)",
    lift: "2rem",
  },
  {
    id: "air",
    label: "Air",
    title: "International air cargo",
    text: "Air freight through Techo International Airport (KTI) in Kandal.",
    image: "/assets/image/airplan_1.png",
    alt: "CLN cargo airplane",
    color: "#D62F1A",
    sky: "radial-gradient(circle at 88% 10%,#fff8dc 0,rgba(255,248,220,0) 26%),linear-gradient(180deg,#bcdcf7 0%,#eaf4fd 100%)",
    lift: "16%",
  },
];

/* ---------- Scenery (inline SVG tiles, no extra images) ---------- */
const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const cloud = (x: number, y: number, k: number) =>
  `<g fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${70 * k}" ry="${24 * k}"/><ellipse cx="${x + 44 * k}" cy="${y - 16 * k}" rx="${44 * k}" ry="${28 * k}"/><ellipse cx="${x - 46 * k}" cy="${y - 8 * k}" rx="${38 * k}" ry="${22 * k}"/></g>`;
const tile = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${body}</svg>`;

const HILLS_FAR = svg(tile(1200, 260, `<path d="M0 160C150 90 300 90 450 150S750 220 900 140 1100 80 1200 160V260H0Z" fill="#cfe7c5"/>`));
const HILLS_NEAR = svg(tile(1200, 260, `<path d="M0 200C200 140 380 150 560 200S900 240 1200 200V260H0Z" fill="#a7d296"/>`));
const WAVE = (opacity: number) =>
  svg(tile(400, 40, `<path d="M0 20Q50 4 100 20T200 20T300 20T400 20" fill="none" stroke="#fff" stroke-opacity="${opacity}" stroke-width="3"/>`));
const CLOUDS_BIG = svg(tile(1400, 220, cloud(180, 90, 1.5) + cloud(700, 150, 1.2) + cloud(1120, 70, 1.6)));
const CLOUDS_SMALL = svg(tile(1000, 160, cloud(140, 80, 0.8) + cloud(560, 50, 0.7) + cloud(860, 110, 0.9)));
const CLOUD_BANK = svg(
  tile(1200, 160, `<path d="M0 90C80 40 160 40 220 80C280 30 380 30 440 80C500 50 600 40 660 80C720 30 820 40 880 85C940 50 1060 40 1120 80C1160 60 1190 70 1200 90V160H0Z" fill="#fff" fill-opacity=".96"/>`)
);

const repeatX: React.CSSProperties = { backgroundRepeat: "repeat-x", position: "absolute", left: 0, right: 0 };

const LAYERS: Layer[] = [
  // Land: hills and a road
  { mode: 0, zone: "ground", speed: 300, style: { ...repeatX, bottom: 48, height: 230, backgroundImage: HILLS_FAR, backgroundSize: "1200px 100%", backgroundPositionY: "bottom" } },
  { mode: 0, zone: "ground", speed: 800, style: { ...repeatX, bottom: 44, height: 150, backgroundImage: HILLS_NEAR, backgroundSize: "1200px 100%", backgroundPositionY: "bottom" } },
  {
    mode: 0,
    zone: "ground",
    speed: 3000,
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 56,
      borderTop: "3px solid #2a2d31",
      backgroundColor: "#3b3f45",
      backgroundImage: "repeating-linear-gradient(90deg,#fff 0 40px,transparent 40px 80px)",
      backgroundSize: "auto 4px",
      backgroundPositionY: "50%",
      backgroundRepeat: "repeat-x",
    },
  },
  // Sea: water and waves
  { mode: 1, zone: "ground", speed: 0, style: { position: "absolute", left: 0, right: 0, bottom: 0, height: "40%", background: "linear-gradient(#6db5de,#1e6c9a)" } },
  { mode: 1, zone: "ground", speed: 400, style: { ...repeatX, bottom: "calc(40% - 14px)", height: 40, backgroundImage: WAVE(0.6), backgroundSize: "400px 40px" } },
  { mode: 1, zone: "ground", speed: 700, style: { ...repeatX, bottom: "26%", height: 40, backgroundImage: WAVE(0.35), backgroundSize: "400px 40px" } },
  { mode: 1, zone: "ground", speed: 1100, style: { ...repeatX, bottom: "10%", height: 40, backgroundImage: WAVE(0.25), backgroundSize: "400px 40px" } },
  // Air: clouds
  { mode: 2, zone: "sky", speed: 500, style: { ...repeatX, top: "6%", height: 220, backgroundImage: CLOUDS_BIG, backgroundSize: "1400px 220px", opacity: 0.85 } },
  { mode: 2, zone: "sky", speed: 900, style: { ...repeatX, top: "34%", height: 160, backgroundImage: CLOUDS_SMALL, backgroundSize: "1000px 160px", opacity: 0.6 } },
  { mode: 2, zone: "ground", speed: 1400, style: { ...repeatX, bottom: 0, height: 140, backgroundImage: CLOUD_BANK, backgroundSize: "1200px 100%", backgroundPositionY: "bottom" } },
];

/* ---------- Helpers ---------- */
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const ease = (t: number) => t * t * (3 - 2 * t);

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/* ---------- Component ---------- */
const TransportSlide: React.FC = () => {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Short landscape screens (small laptops, phones on their side): text left, vehicle right
  const compact = useMediaQuery("(max-height: 640px) and (min-width: 560px)");
  const sectionRef = useRef<HTMLElement>(null);
  const vehicleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = MODES.length;

  const update = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    const p = span > 0 ? clamp(-rect.top / span) : 0;
    const w = window.innerWidth * 1.1;
    const pos = p * n; // 0 .. n

    MODES.forEach((_, i) => {
      const node = vehicleRefs.current[i];
      if (!node) return;
      const u = pos - i;
      const enter = i === 0 ? 1 : ease(clamp((u + 0.2) / 0.4));
      const exit = i === n - 1 ? 0 : ease(clamp((u - 0.8) / 0.4));
      node.style.transform = `translate3d(${(1 - enter) * w - exit * w}px,0,0)`;
    });

    LAYERS.forEach((l, i) => {
      const node = layerRefs.current[i];
      if (node && l.speed) node.style.backgroundPositionX = `${-p * l.speed}px`;
    });

    if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
    setActive(Math.min(n - 1, Math.floor(pos)));
  }, [n]);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced, update]);

  const jumpTo = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * ((i + 0.5) / n), behavior: "smooth" });
  };

  const renderLayers = (mode: number, zone: Layer["zone"]) =>
    LAYERS.map((l, li) =>
      l.mode === mode && l.zone === zone ? (
        <div
          key={li}
          aria-hidden="true"
          ref={(node) => {
            layerRefs.current[li] = node;
          }}
          style={l.style}
        />
      ) : null
    );

  const textBlock = (
    <>
      <h2 className="font-semibold text-neutral-600" style={{ fontSize: compact ? "0.95rem" : "clamp(0.95rem,2.4vh,1.25rem)" }}>
        Land, sea and air. One network.
      </h2>
      <div className="mt-2 grid">
        {MODES.map((m, i) => (
          <div
            key={m.id}
            aria-hidden={active !== i}
            className={`col-start-1 row-start-1 transition-all duration-500 ${
              active === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
            }`}
          >
            <p
              className="font-extrabold leading-none tracking-tight"
              style={{ color: m.color, fontSize: compact ? "clamp(2.5rem,13vh,4.5rem)" : "clamp(2.75rem,11vh,6rem)" }}
            >
              {m.label}
            </p>
            <p className="mt-2 font-bold text-neutral-900" style={{ fontSize: compact ? "1.1rem" : "clamp(1.05rem,2.6vh,1.5rem)" }}>
              {m.title}
            </p>
            <p
              className="mt-1.5 max-w-[56ch] leading-relaxed text-neutral-700"
              style={{ fontSize: compact ? "0.9rem" : "clamp(0.9rem,2vh,1.125rem)" }}
            >
              {m.text}
            </p>
          </div>
        ))}
      </div>
    </>
  );

  /* Reduced motion: plain list, no scroll effects */
  if (reduced) {
    return (
      <section aria-label="Transportation" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-5xl">Land, sea and air. One network.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {MODES.map((m) => (
              <article key={m.id} className="rounded-2xl p-5" style={{ background: m.sky }}>
                <img src={m.image} alt={m.alt} className="h-40 w-full object-contain" loading="lazy" />
                <h3 className="mt-4 text-2xl font-bold" style={{ color: m.color }}>{m.label}</h3>
                <p className="mt-1 font-semibold text-neutral-900">{m.title}</p>
                <p className="mt-2 text-neutral-700">{m.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} aria-label="Transportation" className="relative bg-white" style={{ height: `${n * 100}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Sky backgrounds, one per transport */}
        {MODES.map((m, i) => (
          <div
            key={m.id}
            aria-hidden="true"
            className="absolute inset-0 transition-opacity duration-700"
            style={{ background: m.sky, opacity: active === i ? 1 : 0 }}
          >
            {renderLayers(i, "sky")}
          </div>
        ))}

        {/* Text (stacked above the scene on normal screens) */}
        {!compact && (
          <div
            className="relative z-10 mx-auto w-full max-w-screen-xl px-4 md:px-8"
            style={{ paddingTop: "clamp(1rem,7vh,5rem)" }}
          >
            {textBlock}
          </div>
        )}

        {/* Scenery and vehicles */}
        <div className="relative min-h-0 flex-1">
          {MODES.map((m, i) => (
            <div
              key={m.id}
              aria-hidden="true"
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: active === i ? 1 : 0 }}
            >
              {renderLayers(i, "ground")}
            </div>
          ))}

          {MODES.map((m, i) => (
            <div
              key={m.id}
              ref={(node) => {
                vehicleRefs.current[i] = node;
              }}
              className="absolute top-0 flex items-end justify-center will-change-transform"
              style={{
                left: compact ? "40%" : 0,
                right: 0,
                bottom: m.lift,
                transform: i === 0 ? "none" : "translate3d(110vw,0,0)",
              }}
            >
              <img
                src={m.image}
                alt={m.alt}
                draggable={false}
                className={`max-h-full object-contain object-bottom drop-shadow-[0_12px_14px_rgba(0,0,0,0.18)] ${
                  compact ? "w-[min(56vw,960px)]" : "w-[min(92vw,960px)]"
                }`}
              />
            </div>
          ))}

          {compact && <div className="absolute inset-y-0 left-0 z-10 w-[42%] pl-8 pt-5">{textBlock}</div>}
        </div>

        {/* Progress rail */}
        <div className="relative z-10 bg-white/80 backdrop-blur">
          <div className={`mx-auto w-full max-w-screen-xl px-4 pr-20 md:px-8 md:pr-24 ${compact ? "py-2" : "py-4"}`}>
            <div className={`flex gap-2 ${compact ? "mb-2" : "mb-3"}`}>
              {MODES.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-current={active === i}
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F9748] ${
                    active === i ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
              <div ref={fillRef} className="h-full w-0 rounded-full bg-gradient-to-r from-[#4F9748] to-[#EE3A23]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransportSlide;
