import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import Img from '../components/Img'
import Reveal from '../components/Reveal'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import { brand, products } from '../data/site'

export default function Product() {
  const { slug } = useParams()
  const product = products.find((p) => p.slug === slug)

  const [shot, setShot] = useState(0)
  const [size, setSize] = useState(0)

  if (!product) return <Navigate to="/shop" replace />

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3)
  const enquiry = `Hi ${brand.name}, I'd like to order ${product.name} (${product.sizes[size]}).`

  return (
    <>
      <section className="mx-auto max-w-[1500px] px-5 pt-28 sm:px-8 lg:px-12">
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-sm text-ink/50 transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
          Shop
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            {/* `key` forces the blur-up to replay when the shot changes. */}
            <Img
              key={product.shots[shot]}
              src={product.shots[shot]}
              alt={product.name}
              ratio="aspect-[4/5]"
              priority
              className="rounded-3xl"
            />
            <div className="mt-4 flex gap-3">
              {product.shots.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setShot(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`w-20 overflow-hidden rounded-xl transition-opacity duration-300 sm:w-24 ${
                    i === shot
                      ? 'opacity-100 ring-2 ring-ink ring-offset-2 ring-offset-cream'
                      : 'opacity-55 hover:opacity-90'
                  }`}
                >
                  <Img src={s} alt="" ratio="aspect-square" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:pt-6">
            <p className="eyebrow text-ink/40">{product.kicker}</p>
            <h1 className="display mt-4 text-[clamp(2.6rem,6vw,4.5rem)]">{product.name}</h1>
            <p className="mt-5 max-w-md text-lg text-ink/60">{product.blurb}</p>

            <p className="display mt-10 text-4xl">
              ₹{product.price.toLocaleString('en-IN')}
              <span className="ml-2 align-middle text-sm font-sans text-ink/40">
                / {product.unit}
              </span>
            </p>

            <div className="mt-8">
              <p className="eyebrow text-ink/40">Size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setSize(i)}
                    className={`rounded-full border px-5 py-2.5 text-sm transition-colors duration-300 ${
                      i === size
                        ? 'border-ink bg-ink text-cream'
                        : 'border-ink/15 text-ink/70 hover:border-ink/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                href={`mailto:${brand.email}?subject=${encodeURIComponent('Order: ' + product.name)}&body=${encodeURIComponent(enquiry)}`}
              >
                Order this <ArrowRight size={16} />
              </Button>
              <Button to="/contact" variant="outline">
                Ask a question
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-ink/10 pt-8">
              {product.specs.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs tracking-wide text-ink/40">{k}</dt>
                  <dd className="mt-1 text-sm">{v}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-10 space-y-2.5 text-sm text-ink/60">
              {['No chemical additives', 'Weed-seed free', 'Delivered across Assam'].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check size={15} className="text-moss" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-28 sm:px-8 lg:px-12">
        <h2 className="display text-[clamp(2rem,4.5vw,3.4rem)]">Also from the farm</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3">
          {related.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
