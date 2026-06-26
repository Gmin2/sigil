import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark, ArrowRight } from "./icons";

export type NavLink = { label: string; to: string };

export default function Nav({
  right,
  links = [],
  announcement = true,
}: {
  right?: ReactNode;
  links?: NavLink[];
  announcement?: boolean;
}) {
  return (
    <>
      {announcement && (
        <div className="flex h-9 items-center justify-center gap-2 bg-white text-[13px] text-ink">
          <span className="font-medium">Confidential intents are live on Stacks testnet</span>
          <a href="/#how" className="inline-flex items-center gap-1 text-accent-600">
            Learn more
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-10">
          <Link to="/" className="flex items-center gap-2 text-ink" aria-label="Sigil home">
            <BrandMark className="h-[26px] w-auto text-accent" />
            <span className="font-sans text-[18px] font-medium tracking-[-0.4px]">Sigil</span>
          </Link>

          {links.length > 0 && (
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
              {links.map((l) => {
                const cls =
                  "font-sans text-[16px] tracking-[-0.16px] text-ink transition-colors hover:text-muted";
                return l.to.includes("#") ? (
                  <a key={l.label} href={l.to} className={cls}>
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.label} to={l.to} className={cls}>
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {right ?? (
            <a
              href="/app"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-sans text-[14px] font-medium text-white transition-colors hover:bg-accent-600"
            >
              Launch app
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </header>
    </>
  );
}
