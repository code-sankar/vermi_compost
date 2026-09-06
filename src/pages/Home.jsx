import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import Img from '../components/Img'
import Reveal from '../components/Reveal'
import Marquee from '../components/Marquee'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import { brand, gallery, products, stats, steps, testimonials } from '../data/site'

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink">
      <motion.div style={{ y }} className="absolute inset-0 h-[122%]">
        <Img
          src="/images/hero-field.svg"
          alt="Rows of vegetables growing in composted soil at first light"
          fill
          priority
          imgClass="scale-105"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/20 to-ink/80" />

      <motion.div
        style={{ opacity: fade }}
        className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24"
      >
        <Reveal>
          <p className="eyebrow text-cream/70">{brand.tagline}</p>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="display mt-5 max-w-5xl text-[clamp(3rem,11vw,9.5rem)] text-cream">
            Soil that
            <br />
            <span className="italic text-sage">breathes.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button to="/shop" variant="cream">
              Shop the farm <ArrowRight size={16} />
            </Button>
            <Button to="/process" variant="ghostLight">
              See how it's made
            </Button>
          </div>
        </Reveal>

        <div className="mt-14 hidden items-center gap-3 text-cream/60 sm:flex">
          <ArrowDown size={15} className="animate-bounce" />
          <span className="text-[11px] tracking-[0.24em] uppercase">Scroll</span>
        </div>
      </motion.div>
    </section>
  )
}

function StatBand() {
  return (
    <section className="border-y border-ink/10 bg-sand/60">
      <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-y-10 px-5 py-14 sm:px-8 lg:grid-cols-4 lg:px-12">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07} className="text-center">
            <p className="display text-5xl lg:text-6xl">{s.value}</p>
            <p className="eyebrow mt-2 text-ink/45">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/** Three tall images that stagger vertically as the section passes. */
function Triptych() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const a = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])
  const b = useTransform(scrollYProgress, [0, 1], ['-4%', '8%'])
  const c = useTransform(scrollYProgress, [0, 1], ['9%', '-9%'])
  const lanes = [
    { src: '/images/hands-1.svg', alt: 'Hands cupping finished vermicompost', y: a, pad: 'lg:mt-16' },
    { src: '/images/worms-3.svg', alt: 'Red worms working through castings', y: b, pad: '' },
    { src: '/images/sprouts-1.svg', alt: 'Seedlings breaking through dark soil', y: c, pad: 'lg:mt-24' },
  ]

  return (
    <section ref={ref} className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow text-ink/40">Worm made</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="display mt-5 text-[clamp(2.5rem,6vw,5rem)]">
              Waste in.
              <br />
              <span className="italic text-moss">Life out.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-sm text-ink/60">
              Nothing added, nothing burned. Just kitchen scrap, cow dung and sixty patient days.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <Link
              to="/process"
              className="group mt-9 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-sm"
            >
              The whole process
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {lanes.map((l) => (
            <motion.div key={l.src} style={{ y: l.y }} className={l.pad}>
              <Img src={l.src} alt={l.alt} ratio="aspect-[3/4.6]" className="rounded-2xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Featured() {
  const featured = products.filter((p) => p.featured)

  return (
    <section className="mx-auto max-w-[1500px] px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <h2 className="display text-[clamp(2.2rem,5vw,4rem)]">The shelf</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <Link to="/shop" className="group inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-sm">
            All products
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3">
        {featured.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.08}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Process() {
  return (
    <section className="bg-soil py-24 text-cream lg:py-36">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <p className="eyebrow text-cream/40">Sixty days</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="display mt-5 max-w-2xl text-[clamp(2.4rem,6vw,5rem)]">
            From scrap to <span className="italic text-sage">crumb</span>.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08} className="group">
              <Img src={s.image} alt={s.title} ratio="aspect-[4/5]" zoom className="rounded-2xl">
                <span className="display absolute bottom-3 left-4 text-6xl text-cream/85">{s.n}</span>
              </Img>
              <h3 className="display mt-5 text-2xl">{s.title}</h3>
              <p className="mt-1.5 text-sm text-cream/55">{s.line}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Quote() {
  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden">
      <Img
        src="/images/canopy-1.svg"
        alt="Dense green leaf canopy"
        fill
      />
      <div className="absolute inset-0 bg-ink/45" />
      <div className="relative mx-auto max-w-[1100px] px-5 py-24 text-center sm:px-8">
        <Reveal>
          <p className="display text-[clamp(2rem,5.5vw,4.5rem)] text-cream">
            “Feed the soil, <span className="italic text-sage">not the plant</span>.”
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="eyebrow mt-8 text-cream/55">The only rule on this farm</p>
        </Reveal>
      </div>
    </section>
  )
}

/** Horizontally scrollable strip — image-first, no captions. */
function Strip() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto mb-10 flex max-w-[1500px] flex-wrap items-end justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <Reveal>
          <h2 className="display text-[clamp(2.2rem,5vw,4rem)]">From the beds</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <Link to="/gallery" className="group inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-sm">
            Full gallery
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="no-bar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-12">
        {gallery.slice(0, 10).map((src, i) => (
          <div
            key={src}
            className="w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-[26vw]"
            style={{ marginTop: i % 2 ? '2.5rem' : 0 }}
          >
            <Img src={src} alt="" ratio="aspect-[4/5]" className="rounded-2xl" />
          </div>
        ))}
      </div>
    </section>
  )
}

function Voices() {
  return (
    <section className="border-t border-ink/10 bg-sand/50 py-24 lg:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <h2 className="display text-[clamp(2.2rem,5vw,4rem)]">Growers</h2>
        </Reveal>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.09}>
              <Img src={t.image} alt="" ratio="aspect-[16/10]" className="rounded-2xl" />
              <p className="display mt-6 text-2xl leading-snug">“{t.quote}”</p>
              <p className="mt-4 text-sm">{t.name}</p>
              <p className="text-xs text-ink/45">{t.role}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className="relative overflow-hidden">
      <Img src="/images/soil-macro-3.svg" alt="" fill />
      <div className="absolute inset-0 bg-ink/60" />
      <div className="relative mx-auto max-w-[1500px] px-5 py-28 text-center sm:px-8 lg:px-12 lg:py-40">
        <Reveal>
          <h2 className="display text-[clamp(2.4rem,7vw,6rem)] text-cream">Start with a bag.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/shop" variant="cream">
              Shop now <ArrowRight size={16} />
            </Button>
            <Button to="/contact" variant="ghostLight">
              Ask about bulk
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee
        className="border-b border-ink/10 bg-cream py-4 text-sm tracking-[0.2em] uppercase text-ink/55"
        items={['Chemical free', 'Sieved to 2mm', 'Cured 60 days', 'Delivered across Assam', 'Batch tested']}
      />
      <StatBand />
      <Triptych />
      <Featured />
      <Process />
      <Quote />
      <Strip />
      <Voices />
      <Cta />
    </>
  )
}
