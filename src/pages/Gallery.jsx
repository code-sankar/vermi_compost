import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Img from '../components/Img'
import { gallery } from '../data/site'

export default function Gallery() {
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (open === null) return
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <section className="mx-auto max-w-[1500px] px-5 pt-32 pb-10 sm:px-8 lg:px-12">
        <p className="eyebrow text-ink/40">The farm, mostly</p>
        <h1 className="display mt-4 text-[clamp(3rem,11vw,9rem)]">Gallery</h1>
      </section>

      {/* CSS columns give a true masonry flow without a layout library. */}
      <section className="mx-auto max-w-[1500px] columns-2 gap-3 px-5 pb-28 sm:px-8 md:columns-3 lg:columns-4 lg:gap-4 lg:px-12">
        {gallery.map((src, i) => (
          <button
            key={src}
            onClick={() => setOpen(i)}
            className="group mb-3 block w-full lg:mb-4"
            aria-label="Open image"
          >
            <Img
              src={src}
              alt=""
              ratio={i % 5 === 0 ? 'aspect-[4/5]' : i % 3 === 0 ? 'aspect-square' : 'aspect-[3/4]'}
              zoom
              className="rounded-xl"
            />
          </button>
        ))}
      </section>

      {open !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <button
            className="absolute right-5 top-5 text-cream/70 transition-colors hover:text-cream"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <img
            src={gallery[open]}
            alt=""
            className="max-h-[88svh] max-w-[92vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
