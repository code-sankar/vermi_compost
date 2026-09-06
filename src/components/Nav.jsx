import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { brand } from "../data/site";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/process", label: "Process" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // The home hero is a dark full-bleed image, so the bar starts transparent
  // there and only there — but never while the menu panel is covering it.
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-500 ${
          overHero
            ? "bg-transparent"
            : "bg-cream/85 shadow-[0_1px_0_rgba(25,17,8,0.08)] backdrop-blur-xl"
        }`}
      >
        <nav className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            className={`flex items-baseline gap-2.5 transition-colors ${overHero ? "text-cream" : "text-ink"}`}
          >
            <span className="display text-2xl tracking-tight">
              {brand.name}
            </span>
            <span className="hidden text-[10px] tracking-[0.24em] uppercase opacity-60 sm:inline">
              {brand.tagline}
            </span>
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative py-1 text-sm transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-current after:transition-all after:duration-500 ${
                    isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
                  } ${overHero ? "text-cream/90 hover:text-cream" : "text-ink/70 hover:text-ink"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/shop"
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                overHero
                  ? "bg-cream text-ink hover:bg-sage"
                  : "bg-ink text-cream hover:bg-moss"
              }`}
            >
              Order
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`md:hidden ${overHero ? "text-cream" : "text-ink"}`}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 top-20 z-40 bg-cream px-6 pt-8 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="display border-b border-ink/10 py-5 text-5xl text-ink"
                style={{ animation: `fadeUp 0.5s ${i * 0.06}s both` }}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <Link
            to="/shop"
            className="mt-10 flex items-center justify-center rounded-full bg-ink px-6 py-4 text-cream"
          >
            Order now
          </Link>
          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }`}</style>
        </div>
      )}
    </>
  );
}
