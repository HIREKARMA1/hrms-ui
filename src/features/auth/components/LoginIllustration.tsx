/**
 * Decorative laptop + HRMS dashboard illustration for the login branding panel.
 * Pure SVG — not a screenshot background.
 */
export function LoginIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] select-none" aria-hidden="true">
      {/* Soft teal glow under the scene */}
      <div className="pointer-events-none absolute inset-x-[12%] bottom-0 h-14 rounded-full bg-[#14B8A6]/35 blur-2xl" />

      <svg viewBox="0 0 560 340" className="relative z-10 h-auto w-full max-h-[240px] drop-shadow-2xl xl:max-h-[280px]">
        {/* Desk / base shadow */}
        <ellipse cx="290" cy="312" rx="190" ry="16" fill="rgba(0,0,0,0.28)" />

        {/* Plant pot */}
        <g transform="translate(48 188)">
          <ellipse cx="36" cy="98" rx="28" ry="8" fill="rgba(0,0,0,0.2)" />
          <path
            d="M18 70h36l-4 36c-1 8-8 14-14 14h-4c-6 0-13-6-14-14l-4-36z"
            fill="#E8ECF4"
          />
          <rect x="16" y="64" width="40" height="10" rx="3" fill="#CCFBF1" />
          <path
            d="M36 62c-10-22-4-40 2-48 6 12 12 28 8 48H36z"
            fill="#0F766E"
          />
          <path
            d="M36 62c12-18 22-28 28-32-4 14-10 26-16 32H36z"
            fill="#14B8A6"
          />
          <path
            d="M36 62c-16-10-28-8-34-4 8 10 18 14 26 14h8z"
            fill="#0D9488"
          />
        </g>

        {/* Floating calendar card */}
        <g transform="translate(78 120)">
          <rect
            width="72"
            height="78"
            rx="12"
            fill="#FFFFFF"
            stroke="#E2E6EF"
            strokeWidth="2"
          />
          <rect width="72" height="22" rx="12" fill="#0F766E" />
          <rect y="12" width="72" height="12" fill="#0F766E" />
          <circle cx="22" cy="8" r="3" fill="#CCFBF1" />
          <circle cx="50" cy="8" r="3" fill="#CCFBF1" />
          <text
            x="36"
            y="52"
            textAnchor="middle"
            fill="#17213A"
            fontSize="18"
            fontWeight="700"
            fontFamily="Segoe UI, system-ui, sans-serif"
          >
            24
          </text>
          <circle cx="54" cy="62" r="10" fill="#14B8A6" />
          <path
            d="M49 62.5l3 3 7-7"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Laptop body */}
        <g transform="translate(150 48)">
          {/* Screen bezel */}
          <rect
            x="18"
            y="0"
            width="300"
            height="198"
            rx="14"
            fill="#1E2A44"
            stroke="#2A3A58"
            strokeWidth="3"
          />
          <rect x="28" y="12" width="280" height="168" rx="6" fill="#F7F8FC" />

          {/* Sidebar */}
          <rect x="28" y="12" width="58" height="168" fill="#17213A" rx="6" />
          <rect x="28" y="12" width="58" height="28" fill="#0F766E" />
          <circle cx="42" cy="26" r="5" fill="#CCFBF1" />
          <rect x="38" y="52" width="38" height="6" rx="2" fill="#14B8A6" opacity="0.9" />
          <rect x="38" y="68" width="30" height="5" rx="2" fill="#4B5568" />
          <rect x="38" y="82" width="34" height="5" rx="2" fill="#4B5568" />
          <rect x="38" y="96" width="28" height="5" rx="2" fill="#4B5568" />
          <rect x="38" y="110" width="32" height="5" rx="2" fill="#4B5568" />

          {/* Top bar */}
          <rect x="86" y="18" width="210" height="18" rx="4" fill="#EEF0F6" />
          <circle cx="96" cy="27" r="3" fill="#14B8A6" />
          <rect x="104" y="24" width="70" height="6" rx="2" fill="#CBD5E1" />

          {/* Stat cards */}
          <rect x="94" y="46" width="58" height="36" rx="6" fill="#FFFFFF" stroke="#E2E6EF" />
          <rect x="100" y="52" width="24" height="6" rx="2" fill="#94A3B8" />
          <rect x="100" y="64" width="36" height="10" rx="2" fill="#0F766E" />

          <rect x="160" y="46" width="58" height="36" rx="6" fill="#FFFFFF" stroke="#E2E6EF" />
          <rect x="166" y="52" width="24" height="6" rx="2" fill="#94A3B8" />
          <rect x="166" y="64" width="30" height="10" rx="2" fill="#14B8A6" />

          <rect x="226" y="46" width="58" height="36" rx="6" fill="#FFFFFF" stroke="#E2E6EF" />
          <rect x="232" y="52" width="24" height="6" rx="2" fill="#94A3B8" />
          <rect x="232" y="64" width="34" height="10" rx="2" fill="#0D9488" />

          {/* Bar chart */}
          <rect x="94" y="94" width="100" height="74" rx="8" fill="#FFFFFF" stroke="#E2E6EF" />
          <rect x="106" y="140" width="12" height="18" rx="2" fill="#99F6E4" />
          <rect x="124" y="128" width="12" height="30" rx="2" fill="#5EEAD4" />
          <rect x="142" y="118" width="12" height="40" rx="2" fill="#14B8A6" />
          <rect x="160" y="108" width="12" height="50" rx="2" fill="#0F766E" />

          {/* Donut chart */}
          <g transform="translate(230 108)">
            <circle cx="30" cy="30" r="28" fill="#EEF0F6" />
            <circle
              cx="30"
              cy="30"
              r="28"
              fill="none"
              stroke="#0F766E"
              strokeWidth="12"
              strokeDasharray="88 88"
              strokeDashoffset="22"
              transform="rotate(-90 30 30)"
            />
            <circle
              cx="30"
              cy="30"
              r="28"
              fill="none"
              stroke="#14B8A6"
              strokeWidth="12"
              strokeDasharray="40 136"
              strokeDashoffset="-66"
              transform="rotate(-90 30 30)"
            />
            <circle cx="30" cy="30" r="14" fill="#FFFFFF" />
            <text
              x="30"
              y="34"
              textAnchor="middle"
              fill="#17213A"
              fontSize="10"
              fontWeight="700"
              fontFamily="Segoe UI, system-ui, sans-serif"
            >
              72%
            </text>
          </g>

          {/* Laptop base */}
          <path
            d="M0 204h336l-18 22H18L0 204z"
            fill="#2A3A58"
          />
          <rect x="130" y="210" width="76" height="6" rx="3" fill="#475569" />
        </g>
      </svg>
    </div>
  )
}
