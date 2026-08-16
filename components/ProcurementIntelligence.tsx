type ProcurementIntelligenceProps = {
  className?: string;
  opacity?: number;
  scale?: number;
  x?: number;
  y?: number;
};

export default function ProcurementIntelligence({
  className,
  opacity = 1,
  scale = 1,
  x = 480,
  y = 310,
}: ProcurementIntelligenceProps) {
  return (
    <g
      id="procurement-intelligence"
      className={className}
      opacity={opacity}
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <path
        d="M-68 -38 L0 -72 L68 -38 L68 38 L0 72 L-68 38 Z"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="1.4"
      />
      <path
        d="M-42 -24 L0 -45 L42 -24 L42 24 L0 45 L-42 24 Z"
        fill="var(--color-sunken)"
        stroke="var(--color-rule-hover)"
        strokeWidth="1.2"
      />
      <path
        d="M-18 -10 L0 -19 L18 -10 L18 10 L0 19 L-18 10 Z"
        fill="var(--color-surface)"
        stroke="var(--color-accent)"
        strokeWidth="1.3"
      />
      <path
        d="M-68 0 L-42 0"
        stroke="var(--color-rule-hover)"
        strokeWidth="1.1"
      />
      <path
        d="M42 0 L68 0"
        stroke="var(--color-rule-hover)"
        strokeWidth="1.1"
      />
      <path
        d="M0 -72 L0 -45"
        stroke="var(--color-rule-hover)"
        strokeWidth="1.1"
      />
      <path
        d="M0 45 L0 72"
        stroke="var(--color-rule-hover)"
        strokeWidth="1.1"
      />
      <path
        d="M-28 -47 L-15 -39"
        stroke="var(--color-rule)"
        strokeWidth="1.1"
      />
      <path
        d="M28 47 L15 39"
        stroke="var(--color-rule)"
        strokeWidth="1.1"
      />
    </g>
  );
}
