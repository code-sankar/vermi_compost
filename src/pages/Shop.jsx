import { useMemo, useState } from 'react'
import Img from '../components/Img'
import Reveal from '../components/Reveal'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/site'

export default function Shop() {
  const [active, setActive] = useState('All')

  const shown = useMemo(
    () => (active === 'All' ? products : products.filter((p) => p.tags.includes(active))),
    [active],
  )

  return (
    <>
      <section className="relative h-[52svh] min-h-[380px] overflow-hidden bg-ink">
        <Img src="/images/castings-1.svg" alt="Close-up of finished worm castings" fill priority />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1500px] px-5 pb-12 sm:px-8 lg:px-12">
          <p className="eyebrow text-cream/60">Everything we make</p>
          <h1 className="display mt-4 text-[clamp(3rem,10vw,8rem)] text-cream">Shop</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="no-bar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 rounded-full border px-5 py-2 text-sm transition-colors duration-300 ${
                active === c
                  ? 'border-ink bg-ink text-cream'
                  : 'border-ink/15 text-ink/60 hover:border-ink/40 hover:text-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-3">
          {shown.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.07}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>

        {shown.length === 0 && <p className="py-24 text-center text-ink/40">Nothing here yet.</p>}
      </section>
    </>
  )
}
