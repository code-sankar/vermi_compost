/**
 * Seamless ticker. The track holds the items twice and slides exactly half
 * its width, so the loop point is invisible.
 */
export default function Marquee({ items, className = '', duration = 34 }) {
  return (
    <div className={`group relative flex overflow-hidden ${className}`}>
      <div
        className="flex shrink-0 items-center gap-14 pr-14 will-change-transform group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animation: `marquee ${duration}s linear infinite` }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-14 whitespace-nowrap">
            {item}
            <span aria-hidden className="text-current opacity-40">
              ✦
            </span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  )
}
