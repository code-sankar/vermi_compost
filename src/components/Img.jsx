import { useState } from 'react'

/**
 * Every image on the site goes through here so loading behaviour, the
 * blur-up and the hover zoom stay identical everywhere.
 */
export default function Img({
  src,
  alt = '',
  ratio = 'aspect-[4/5]',
  fill = false,
  bg = 'bg-sand',
  className = '',
  imgClass = '',
  zoom = false,
  priority = false,
  children,
}) {
  const [loaded, setLoaded] = useState(false)

  const shape = fill ? 'absolute inset-0' : `relative ${ratio}`

  return (
    <div className={`${shape} overflow-hidden ${bg} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-xl'
        } ${zoom ? 'group-hover:scale-[1.06]' : ''} ${imgClass}`}
      />
      {children}
    </div>
  )
}
