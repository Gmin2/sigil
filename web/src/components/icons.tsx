type IconProps = { className?: string };

// sBTC mark — bitcoin B in an outline coin, inherits currentColor (no orange)
export function SbtcMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9 7.5h3.9c1.5 0 2.4.8 2.4 2 0 .9-.5 1.5-1.3 1.8.9.3 1.5 1 1.5 2 0 1.4-1 2.2-2.7 2.2H9V7.5Zm1.9 1.6v1.9h1.6c.6 0 1-.4 1-.95s-.4-.95-1-.95h-1.6Zm0 3.4v2h1.7c.7 0 1.1-.4 1.1-1s-.4-1-1.2-1h-1.6Z"
        fill="currentColor"
      />
      <path d="M11 5.4v1.5M13 5.4v1.5M11 17.1v1.5M13 17.1v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// swap / exchange — two arrows, opposite directions
export function Swap({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 8h13l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16H7l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// brand mark — a sealed block: rounded square with the diagonal hatch motif
// (same hatch the conveyor uses for a hidden amount). currentColor throughout.
export function BrandMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5.5" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M8 14.5 14.5 8M11 17 17 11"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wallet({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H17a1 1 0 0 1 0 2H6a1 1 0 0 0 0 2h12.5A2.5 2.5 0 0 1 21 11.5v6A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" fill="currentColor" />
      <circle cx="16.5" cy="14.5" r="1.5" fill="#fff" />
    </svg>
  );
}

export function Lock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m16 10v-4c0-2.209-1.791-4-4-4s-4 1.791-4 4v4" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="10" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function Eye({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M1.125 12S4.989 4 12 4s10.875 8 10.875 8-3.865 8-10.875 8S1.125 12 1.125 12Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function EyeSlash({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m6.07 17.93c-3.226-2.37-4.945-5.93-4.945-5.93s3.864-8 10.875-8c2.334 0 4.32.887 5.93 2.07" stroke="currentColor" strokeWidth="2" />
      <path d="m20.804 8.853c1.362 1.678 2.071 3.147 2.071 3.147s-3.865 8-10.875 8c-.734 0-1.434-.088-2.098-.245" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <line x1="22" y1="2" x2="2" y2="22" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="12 15 17 10 12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Copy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="8" y="8" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 4.5A2 2 0 0 0 14 3H5a2 2 0 0 0-2 2v9a2 2 0 0 0 1.5 1.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Check({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <polyline points="3 13 8 19 21 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M8 21 17 12 8 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function Equal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 9h14M5 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowDownUp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7 4v16M7 20l-3-3M7 20l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 20V4M17 4l-3 3M17 4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M21 8 12 17 3 8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function GithubLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M16,2.345c7.735,0,14,6.265,14,14-.002,6.015-3.839,11.359-9.537,13.282-.7,.14-.963-.298-.963-.665,0-.473,.018-1.978,.018-3.85,0-1.312-.437-2.152-.945-2.59,3.115-.35,6.388-1.54,6.388-6.912,0-1.54-.543-2.783-1.435-3.762,.14-.35,.63-1.785-.14-3.71,0,0-1.173-.385-3.85,1.435-1.12-.315-2.31-.472-3.5-.472s-2.38,.157-3.5,.472c-2.677-1.802-3.85-1.435-3.85-1.435-.77,1.925-.28,3.36-.14,3.71-.892,.98-1.435,2.24-1.435,3.762,0,5.355,3.255,6.563,6.37,6.913-.403,.35-.77,.963-.893,1.872-.805,.368-2.818,.963-4.077-1.155-.263-.42-1.05-1.452-2.152-1.435-1.173,.018-.472,.665,.017,.927,.595,.332,1.277,1.575,1.435,1.978,.28,.787,1.19,2.293,4.707,1.645,0,1.173,.018,2.275,.018,2.607,0,.368-.263,.787-.963,.665-5.719-1.904-9.576-7.255-9.573-13.283,0-7.735,6.265-14,14-14Z"
      />
    </svg>
  );
}

export function BookOpen({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <line x1="12" y1="6" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
      <path d="m17.5 3c-3 0-5.5 1.3-5.5 3 0-1.7-2.5-3-5.5-3S1 4.3 1 6v15c0-1.7 2.5-3 5.5-3s5.5 1.3 5.5 3c0-1.7 2.5-3 5.5-3s5.5 1.3 5.5 3V6c0-1.7-2.5-3-5.5-3Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// custom gavel for solver auction
export function Gavel({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m9.5 8.5 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="11.3" y="4.2" width="4" height="9" rx="1" transform="rotate(-45 13.3 8.7)" stroke="currentColor" strokeWidth="2" />
      <path d="m6 12 4 4-3.5 3.5a2 2 0 0 1-2.8-2.8L6 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="14" y1="21" x2="22" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Clock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <polyline points="8 7 12 12 16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M20.3777 12.9014 21 4.5l-.5501-.055c-2.9419-.2942-5.8054-1.1228-8.4499-2.445-2.6445 1.3222-5.508 2.1508-8.4499 2.445L3 4.5l.6224 8.4014c.2342 3.1618 2.115 5.9671 4.9504 7.385L12 22l3.4272-1.7136c2.8358-1.4179 4.7163-4.2232 4.9505-7.385Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12 11 14 16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// stacked layers — system architecture
export function Layers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3 21 8 12 13 3 8 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m3 12 9 5 9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3 16 9 5 9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// app launcher — 2x2 grid
export function Grid({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
