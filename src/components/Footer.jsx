import { Link } from 'react-router-dom'
import Img from './Img'
import { brand, products } from '../data/site'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute inset-0">
        <Img src="/images/texture-1.svg" fill bg="bg-ink" imgClass="opacity-[0.16]" />
        <div className="absolute inset-0 bg-ink/30" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="display text-5xl">{brand.name}</p>
            <p className="mt-3 text-sm text-cream/60">{brand.tagline}</p>
            <p className="display mt-10 max-w-xs text-2xl leading-tight text-cream/90">
              {brand.line}
            </p>
          </div>

          <div>
            <p className="eyebrow text-cream/40">Shop</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {products.slice(0, 5).map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/shop/${p.slug}`}
                    className="text-cream/70 transition-colors hover:text-cream"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-cream/40">Visit</p>
            <address className="mt-5 space-y-1 text-sm not-italic text-cream/70">
              {brand.address.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </address>
            <div className="mt-5 space-y-1 text-sm">
              <a
                href={`tel:${brand.phone.replace(/\s/g, '')}`}
                className="block text-cream/70 hover:text-cream"
              >
                {brand.phone}
              </a>
              <a href={`mailto:${brand.email}`} className="block text-cream/70 hover:text-cream">
                {brand.email}
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow text-cream/40">Follow</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {brand.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-cream/70 transition-colors hover:text-cream">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-cream/15 pt-7 text-xs text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name} — {brand.tagline}
          </p>
          <p>Made by worms. Assembled in Assam.</p>
        </div>
      </div>
    </footer>
  )
}
