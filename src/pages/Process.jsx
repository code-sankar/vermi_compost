import Img from '../components/Img'
import Reveal from '../components/Reveal'
import Button from '../components/Button'
import Marquee from '../components/Marquee'
import { steps } from '../data/site'
import { ArrowRight } from 'lucide-react'

const detail = [
  {
    image: '/images/beds-2.svg',
    title: 'Shaded troughs',
    line: 'Brick beds, roofed and always damp.',
  },
  { image: '/images/worms-2.svg', title: 'Eisenia fetida', line: 'Roughly 800 reds to the kilo.' },
  {
    image: '/images/soil-macro-1.svg',
    title: 'Screened fine',
    line: 'Two millimetres, nothing coarser.',
  },
  {
    image: '/images/hands-2.svg',
    title: 'Packed by hand',
    line: 'Bagged the same week it is sieved.',
  },
]

export default function Process() {
  return (
    <>
      <section className="relative h-[62svh] min-h-[420px] overflow-hidden bg-ink">
        <Img src="/images/beds-1.svg" alt="Vermicompost beds seen from above" fill priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/25" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1500px] px-5 pb-14 sm:px-8 lg:px-12">
          <p className="eyebrow text-cream/60">How it is made</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.8rem,9vw,7rem)] text-cream">
            Sixty days, <span className="italic text-sage">no shortcuts</span>.
          </h1>
        </div>
      </section>

      <Marquee
        className="border-b border-ink/10 bg-cream py-4 text-sm tracking-[0.2em] uppercase text-ink/55"
        items={['Collect', 'Layer', 'Damp', 'Worm', 'Cure', 'Sieve', 'Pack']}
      />

      {/* Alternating full-width steps — image left, then image right. */}
      {steps.map((s, i) => (
        <section key={s.n} className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
              i % 2 ? 'lg:[&>*:first-child]:order-2' : ''
            }`}
          >
            <Reveal>
              <Img src={s.image} alt={s.title} ratio="aspect-[5/4]" className="rounded-3xl" />
            </Reveal>
            <Reveal delay={0.1}>
              <p className="display text-7xl text-ink/15 lg:text-8xl">{s.n}</p>
              <h2 className="display mt-4 text-[clamp(2.2rem,5vw,4rem)]">{s.title}</h2>
              <p className="mt-5 max-w-sm text-lg text-ink/60">{s.line}</p>
            </Reveal>
          </div>
        </section>
      ))}

      <section className="bg-soil py-24 text-cream lg:py-32">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <h2 className="display text-[clamp(2.2rem,5vw,4rem)]">Details</h2>
          </Reveal>
          <div className="mt-14 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {detail.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.08} className="group">
                <Img
                  src={d.image}
                  alt={d.title}
                  ratio="aspect-[4/5]"
                  zoom
                  className="rounded-2xl"
                />
                <h3 className="display mt-5 text-2xl">{d.title}</h3>
                <p className="mt-1.5 text-sm text-cream/55">{d.line}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-28 text-center sm:px-8 lg:px-12">
        <Reveal>
          <h2 className="display text-[clamp(2.2rem,6vw,5rem)]">Want a batch report?</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/contact">
              Talk to us <ArrowRight size={16} />
            </Button>
            <Button to="/shop" variant="outline">
              Browse products
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  )
}
