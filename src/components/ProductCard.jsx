import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Img from './Img'

export default function ProductCard({ product, ratio = 'aspect-[4/5]' }) {
  return (
    <Link to={`/shop/${product.slug}`} className="group block">
      <Img src={product.image} alt={product.name} ratio={ratio} zoom className="rounded-2xl">
        {product.kicker && (
          <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[10px] tracking-[0.18em] uppercase text-ink backdrop-blur">
            {product.kicker}
          </span>
        )}
        <span className="absolute right-4 top-4 flex size-9 translate-y-2 items-center justify-center rounded-full bg-ink text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={16} />
        </span>
      </Img>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="display text-xl">{product.name}</h3>
        <span className="shrink-0 text-sm text-ink/50">
          ₹{product.price.toLocaleString('en-IN')}
        </span>
      </div>
      <p className="mt-1 text-xs tracking-wide text-ink/40">{product.unit}</p>
    </Link>
  )
}
