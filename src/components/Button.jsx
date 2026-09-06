import { Link } from 'react-router-dom'

const styles = {
  solid: 'bg-ink text-cream hover:bg-soil',
  leaf: 'bg-moss text-cream hover:bg-ink',
  cream: 'bg-cream text-ink hover:bg-sage',
  outline: 'border border-current text-ink hover:bg-ink hover:text-cream',
  ghostLight: 'border border-cream/50 text-cream hover:bg-cream hover:text-ink',
}

export default function Button({ to, href, variant = 'solid', className = '', children, ...rest }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300 ${styles[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  )
}
