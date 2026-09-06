import { useState } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import Img from '../components/Img'
import Reveal from '../components/Reveal'
import { brand, products } from '../data/site'

const field =
  'w-full rounded-xl border border-ink/15 bg-paper px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-ink'

export default function Contact() {
  const [sent, setSent] = useState(false)

  /**
   * No backend here yet — the form hands the enquiry to the visitor's mail
   * client. Swap this for a POST when an endpoint exists.
   */
  const onSubmit = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const body = [
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Interested in: ${data.product}`,
      '',
      data.message,
    ].join('\n')
    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(
      `Enquiry from ${data.name}`
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <>
      <section className="relative h-[46svh] min-h-[320px] overflow-hidden bg-ink">
        <Img src="/images/field-wide.svg" alt="Composted field at dawn" fill priority />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1500px] px-5 pb-12 sm:px-8 lg:px-12">
          <p className="eyebrow text-cream/60">Come by, or write</p>
          <h1 className="display mt-4 text-[clamp(3rem,10vw,8rem)] text-cream">Contact</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-24 lg:px-12">
        <Reveal>
          <div className="space-y-9">
            {[
              { icon: Phone, label: 'Phone', value: brand.phone, href: `tel:${brand.phone.replace(/\s/g, '')}` },
              { icon: Mail, label: 'Email', value: brand.email, href: `mailto:${brand.email}` },
              { icon: MapPin, label: 'Farm', value: brand.address.join(', ') },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-sand text-soil">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="eyebrow text-ink/40">{label}</p>
                  {href ? (
                    <a href={href} className="mt-1.5 block transition-colors hover:text-moss">
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1.5 max-w-[16rem]">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <Img
              src="/images/hands-2.svg"
              alt="Hands holding finished compost"
              ratio="aspect-[16/11]"
              className="rounded-2xl"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" required placeholder="Name" className={field} />
              <input name="phone" required placeholder="Phone" className={field} />
            </div>
            <select name="product" defaultValue="" className={field} required>
              <option value="" disabled>
                What are you after?
              </option>
              {products.map((p) => (
                <option key={p.slug} value={p.name}>
                  {p.name}
                </option>
              ))}
              <option value="Something else">Something else</option>
            </select>
            <textarea name="message" rows={6} placeholder="Quantity, delivery, anything else" className={field} />

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-cream transition-colors duration-300 hover:bg-moss"
            >
              {sent ? 'Opening your mail app…' : 'Send enquiry'} <Send size={15} />
            </button>

            <p className="pt-1 text-xs text-ink/40">
              This opens your email app with the message ready to send.
            </p>
          </form>
        </Reveal>
      </section>
    </>
  )
}
