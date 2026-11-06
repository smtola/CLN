import SplitWords from '../../../components/ui/SplitWords';

export default function MovementInMotion() {
  return (
    <section id="movement" aria-label="We move the world forward" className="flex min-h-[70svh] items-center overflow-hidden bg-cln-navy py-section text-white lg:min-h-svh">
      <div className="cln-shell">
        <p className="cln-eyebrow !text-white/90">Movement in motion</p>
        <SplitWords as="h2" text="WE MOVE THE WORLD FORWARD." accent={['forward']} className="mt-6 block origin-left font-display text-display font-extrabold" />
        <p data-movement-copy className="mt-8 max-w-2xl font-body text-lead text-white/70">
          With over 30 years of experience in import and export logistics, we help our customers make all the possible moves in their supply chains.
        </p>
      </div>
    </section>
  );
}
