const links = [
  { label: "How it works", href: "/#how" },
  { label: "App", href: "/app" },
  { label: "GitHub", href: "https://github.com" },
];

export default function Footer() {
  return (
    <footer className="overflow-hidden text-white">
      {/* stacks-style stepped separator (rounded notch, not a straight line) */}
      <svg
        className="block h-[64px] w-full sm:h-[88px]"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,120 L0,18 H716 A24,24 0 0 1 740,42 V54 A24,24 0 0 0 764,78 H1440 V120 Z"
          fill="#5a4bff"
        />
      </svg>

      <div className="bg-accent">
        <div className="mx-auto max-w-[1280px] px-6">
          {/* minimal top row */}
          <div className="flex flex-col gap-4 py-12 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex items-center gap-7">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="font-sans text-[15px] text-white/75 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <p className="font-mono text-[12px] text-white/55">© 2026 Sigil · built on Stacks</p>
          </div>

          {/* big company wordmark, bled off the bottom edge */}
          <div
            className="select-none font-sans font-medium leading-[0.82] tracking-[-0.04em] text-white"
            style={{ fontSize: "clamp(96px, 23vw, 380px)", marginBottom: "-0.12em" }}
          >
            Sigil
          </div>
        </div>
      </div>
    </footer>
  );
}
