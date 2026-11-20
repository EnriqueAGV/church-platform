/**
 * Academia Tabnít logo, drawn with live type so it stays crisp at any size.
 * Meant to sit on the green leaf background. Scale it with `text-*` on the wrapper.
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Academia Tabnít"
      className={`inline-flex flex-col items-start leading-none select-none ${className}`}
    >
      {/* Outlined frame that runs from the crosshair up to the ACADÉMIA tag */}
      <span className="ml-[0.45em] flex items-end">
        <span className="h-[0.55em] w-[0.9em] border-t-[0.06em] border-l-[0.06em] border-white" />
        <span className="border-[0.06em] border-white bg-white px-[0.25em] py-[0.12em]">
          <span
            className="block h-[0.36em] w-[2.27em] bg-brand"
            style={{
              maskImage: "url(/brand/academia-wordmark.png)",
              WebkitMaskImage: "url(/brand/academia-wordmark.png)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
          />
        </span>
      </span>
      <span className="flex items-center gap-[0.08em]">
        <Crosshair className="h-[0.9em] w-[0.9em] text-white" />
        <span className="text-[1.6em] font-black tracking-tight text-white italic">
          TABNÍT
        </span>
      </span>
    </span>
  );
}

export function Crosshair({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 1v7M12 16v7M1 12h7M16 12h7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
