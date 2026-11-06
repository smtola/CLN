import React, { useCallback, useEffect, useRef, useState } from "react";

type Mood = "hello" | "listening" | "typing" | "invalid" | "sent";

// Put cln-mascot.html in /public/assets/mascot/. "?embed=1" shows only the mascot.
const MASCOT_SRC = "/assets/mascot/cln-mascot.htm?embed=1";

const MOODS: Record<Mood, { expression: string; text: string }> = {
  hello: { expression: "Hello", text: "Hello! Tell us what you want to ship." },
  listening: { expression: "Happy", text: "I’m listening. Take your time." },
  typing: { expression: "Thinking", text: "Hmm, finding the best route for you…" },
  invalid: { expression: "Worried", text: "Almost there. Please check the highlighted fields." },
  sent: { expression: "Love", text: "Thank you for contacting CLN!" },
};

const POP_CSS = `
@keyframes clnPop{from{opacity:0;transform:translateY(4px) scale(.98)}to{opacity:1;transform:none}}
.cln-pop{animation:clnPop .3s ease-out}
@media (prefers-reduced-motion:reduce){.cln-pop{animation:none}}
`;

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

type Props = {
  /** Element that wraps the contact form. The mascot reacts to what happens inside it. */
  watchRef: React.RefObject<HTMLElement | null>;
};

const ContactMascot: React.FC<Props> = ({ watchRef }) => {
  const [mood, setMood] = useState<Mood>("hello");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const timer = useRef(0);
  const retryTimer = useRef(0);
  const wide = useMediaQuery("(min-width: 1024px)");

  const post = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(msg, window.location.origin);
  }, []);

  // True only when the mascot page really loaded and drew its WebGL canvas.
  // onLoad also fires for 404 pages, SPA fallbacks and blocked frames, so we check the content.
  const mascotRendered = useCallback(() => {
    try {
      return !!iframeRef.current?.contentDocument?.querySelector("#stage canvas");
    } catch {
      return false; // cross-origin / blocked frame
    }
  }, []);

  const handleLoad = useCallback(() => {
    window.clearTimeout(retryTimer.current);
    if (mascotRendered()) {
      setFailed(false);
      setReady(true);
      return;
    }
    // Give the 3D scene a moment to start, then check again
    retryTimer.current = window.setTimeout(() => {
      if (mascotRendered()) {
        setFailed(false);
        setReady(true);
      } else {
        setReady(false);
        setFailed(true);
        console.warn(
          "[ContactMascot] Mascot did not render. Open " + MASCOT_SRC + " directly and check the DevTools Console / Network tab " +
            "(missing file, SPA rewrite, X-Frame-Options / frame-ancestors, CSP script-src, or WebGL disabled)."
        );
      }
    }, 1200);
  }, [mascotRendered]);

  useEffect(() => () => window.clearTimeout(retryTimer.current), []);

  // Send the current expression and the viewing angle to the 3D mascot
  useEffect(() => {
    if (ready) post({ type: "cln-expression", name: MOODS[mood].expression });
  }, [mood, ready, post]);

  useEffect(() => {
    // Beside the form it faces left toward it; above the form it faces the visitor
    if (ready) post({ type: "cln-view", angle: wide ? -0.45 : 0.2 });
  }, [wide, ready, post]);

  // Stop rendering while the mascot is off screen
  useEffect(() => {
    const el = cardRef.current;
    if (!ready || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => post({ type: "cln-pause", paused: !entry.isIntersecting }));
    io.observe(el);
    return () => io.disconnect();
  }, [ready, post]);

  // React to the form: focus, typing, validation errors and submit
  useEffect(() => {
    const root = watchRef.current;
    if (!root) return;

    const later = (m: Mood, ms: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMood(m), ms);
    };
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);

    const onFocusIn = (e: Event) => {
      if (!isField(e.target)) return;
      window.clearTimeout(timer.current);
      setMood("listening");
    };
    const onInput = (e: Event) => {
      if (!isField(e.target)) return;
      setMood("typing");
      later("listening", 1500);
    };
    const onInvalid = () => {
      setMood("invalid");
      later("listening", 4000);
    };
    const onSubmit = () => {
      setMood("sent");
      later("listening", 6000);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!root.contains(e.relatedTarget as Node | null)) later("hello", 2500);
    };

    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("input", onInput);
    root.addEventListener("invalid", onInvalid, true); // "invalid" does not bubble
    root.addEventListener("submit", onSubmit);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      window.clearTimeout(timer.current);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("input", onInput);
      root.removeEventListener("invalid", onInvalid, true);
      root.removeEventListener("submit", onSubmit);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [watchRef]);

  return (
    <aside
      ref={cardRef}
      aria-label="CLN mascot"
      className="overflow-hidden rounded-3xl border border-[#4F9748]/25 bg-gradient-to-b from-white to-[#eaf5e6] p-4 shadow-lg lg:p-6"
    >
      <style>{POP_CSS}</style>
      <div className="flex items-center gap-3 lg:flex-col-reverse lg:items-stretch lg:gap-4">
        {/* Mascot */}
        <div className="relative h-32 w-32 shrink-0 rounded-2xl bg-[radial-gradient(circle_at_50%_62%,rgba(79,151,72,0.2),transparent_66%)] lg:h-[300px] lg:w-full">
          <iframe
            ref={iframeRef}
            src={MASCOT_SRC}
            title="CLN container mascot"
            aria-hidden="true"
            tabIndex={-1}
            onLoad={handleLoad}
            className={`h-full w-full border-0 bg-transparent ${failed ? "invisible" : ""}`}
          />
          {/* Fallback if the 3D mascot could not load */}
          {failed && (
            <div className="absolute inset-0 grid place-items-center text-6xl" aria-hidden="true">
              📦
            </div>
          )}
        </div>

        {/* Speech bubble, also announced to screen readers */}
        <div
          role="status"
          aria-live="polite"
          className="relative min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 lg:flex-none"
        >
          <span
            aria-hidden="true"
            className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-white ring-1 ring-black/5 [clip-path:polygon(0_0,0_100%,100%_100%)] lg:-bottom-1.5 lg:left-1/2 lg:top-auto lg:-translate-x-1/2 lg:translate-y-0 lg:[clip-path:polygon(100%_0,100%_100%,0_100%)]"
          />
          <span key={mood} className="cln-pop relative block text-[15px] font-medium leading-snug text-neutral-800">
            {MOODS[mood].text}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default ContactMascot;
