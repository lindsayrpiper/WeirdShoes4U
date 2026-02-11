export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shoe icon */}
      <g transform="translate(0, 4)">
        {/* Sole */}
        <path
          d="M4 28C4 28 6 32 16 32C26 32 30 30 32 28C34 26 34 24 32 22L20 14C18 12 14 12 12 14L4 22C2 24 2 26 4 28Z"
          fill="#E1567C"
        />
        {/* Upper shoe */}
        <path
          d="M8 22L14 16C16 14 20 14 22 16L30 22C28 20 24 18 20 18C16 18 12 20 8 22Z"
          fill="#F58CA3"
        />
        {/* Lightning bolt accent */}
        <path
          d="M18 8L14 18H20L16 28L24 16H18L22 8H18Z"
          fill="#6C5FC7"
          opacity="0.9"
        />
      </g>

      {/* Text: Weird */}
      <text
        x="42"
        y="27"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#EBE6EF"
        letterSpacing="-0.5"
      >
        Weird
      </text>

      {/* Text: Shoes */}
      <text
        x="112"
        y="27"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#E1567C"
        letterSpacing="-0.5"
      >
        Shoes
      </text>

      {/* Text: 4U */}
      <text
        x="186"
        y="27"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#6C5FC7"
        letterSpacing="-0.5"
      >
        4U
      </text>
    </svg>
  );
}
