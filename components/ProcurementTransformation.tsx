type ProcurementTransformationProps = {
  className?: string;
  titleId?: string;
};

export default function ProcurementTransformation({
  className,
  titleId = "procurement-transformation-title",
}: ProcurementTransformationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 960 620"
      role="img"
      aria-labelledby={titleId}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>
        Fragmented procurement information before it becomes structured.
      </title>

      <g
        id="fragment-boq-line-item"
        transform="translate(72 92) rotate(-5 190 42)"
      >
        <path
          d="M0 10 L330 0 L380 28 L368 92 L28 86 L0 60 Z"
          fill="var(--color-surface)"
          stroke="var(--color-ink)"
          strokeWidth="1.6"
        />
        <path
          d="M27 24 L318 18"
          stroke="var(--color-rule-hover)"
          strokeWidth="1.4"
        />
        <path
          d="M29 54 L229 50"
          stroke="var(--color-rule)"
          strokeWidth="1.4"
        />
        <text
          x="31"
          y="43"
          fill="var(--color-ink)"
          fontFamily="var(--font-body)"
          fontSize="17"
          fontWeight="500"
        >
          AHU 20,000 CFM
        </text>
        <text
          x="303"
          y="68"
          fill="var(--color-ink-muted)"
          fontFamily="var(--font-body)"
          fontSize="14"
          textAnchor="end"
        >
          BOQ / M-04
        </text>
      </g>

      <g id="fragment-supplier" transform="translate(690 232) rotate(7 98 46)">
        <path
          d="M14 0 L184 10 L196 72 L172 94 L18 82 L0 36 Z"
          fill="var(--color-paper)"
          stroke="var(--color-ink)"
          strokeWidth="1.6"
        />
        <circle
          cx="32"
          cy="31"
          r="7"
          fill="var(--color-accent)"
        />
        <path
          d="M54 28 L156 34"
          stroke="var(--color-rule-hover)"
          strokeWidth="1.5"
        />
        <path
          d="M31 58 L151 65"
          stroke="var(--color-rule)"
          strokeWidth="1.5"
        />
        <text
          x="54"
          y="25"
          fill="var(--color-ink)"
          fontFamily="var(--font-body)"
          fontSize="15"
          fontWeight="500"
        >
          Gulf Ductwork
        </text>
        <text
          x="31"
          y="76"
          fill="var(--color-ink-muted)"
          fontFamily="var(--font-body)"
          fontSize="12"
        >
          supplier record
        </text>
      </g>

      <g
        id="fragment-document-line-item"
        transform="translate(392 404) rotate(3 72 104)"
      >
        <path
          d="M23 0 L142 10 L152 196 L0 184 L8 34 Z"
          fill="var(--color-sunken)"
          stroke="var(--color-ink)"
          strokeWidth="1.6"
        />
        <path
          d="M34 33 L117 40"
          stroke="var(--color-ink)"
          strokeWidth="1.4"
        />
        <path
          d="M27 65 L126 72"
          stroke="var(--color-rule-hover)"
          strokeWidth="1.4"
        />
        <path
          d="M25 92 L118 99"
          stroke="var(--color-rule-hover)"
          strokeWidth="1.4"
        />
        <path
          d="M23 119 L92 124"
          stroke="var(--color-rule)"
          strokeWidth="1.4"
        />
        <path
          d="M20 147 L126 154"
          stroke="var(--color-rule)"
          strokeWidth="1.4"
        />
        <text
          x="35"
          y="29"
          fill="var(--color-ink)"
          fontFamily="var(--font-body)"
          fontSize="13"
          fontWeight="500"
        >
          Spec line
        </text>
        <text
          x="24"
          y="174"
          fill="var(--color-ink-muted)"
          fontFamily="var(--font-body)"
          fontSize="12"
        >
          drawing ref.
        </text>
      </g>

      <g id="fragment-quotation" transform="translate(548 78) rotate(-4 132 62)">
        <path
          d="M0 17 L232 0 L265 42 L248 123 L27 138 L8 94 Z"
          fill="var(--color-surface)"
          stroke="var(--color-ink)"
          strokeWidth="1.6"
        />
        <path
          d="M28 39 L196 28"
          stroke="var(--color-rule-hover)"
          strokeWidth="1.4"
        />
        <path
          d="M29 68 L226 55"
          stroke="var(--color-rule)"
          strokeWidth="1.4"
        />
        <path
          d="M31 96 L164 87"
          stroke="var(--color-rule)"
          strokeWidth="1.4"
        />
        <text
          x="30"
          y="35"
          fill="var(--color-ink)"
          fontFamily="var(--font-body)"
          fontSize="16"
          fontWeight="500"
        >
          QTN-1837
        </text>
        <text
          x="218"
          y="111"
          fill="var(--color-ink-muted)"
          fontFamily="var(--font-body)"
          fontSize="13"
          textAnchor="end"
        >
          validity 14d
        </text>
      </g>

      <g id="fragment-price" transform="translate(606 430) rotate(4 104 44)">
        <path
          d="M12 0 L218 8 L204 88 L0 76 Z"
          fill="var(--color-paper)"
          stroke="var(--color-accent)"
          strokeWidth="1.8"
        />
        <path
          d="M24 55 L170 61"
          stroke="var(--color-rule-hover)"
          strokeWidth="1.4"
        />
        <text
          x="25"
          y="39"
          fill="var(--color-accent)"
          fontFamily="var(--font-display)"
          fontSize="27"
          fontWeight="600"
        >
          AED 42,000
        </text>
        <text
          x="25"
          y="69"
          fill="var(--color-ink-muted)"
          fontFamily="var(--font-body)"
          fontSize="12"
        >
          unit rate pending
        </text>
      </g>

      <g id="fragment-quantity" transform="translate(132 350) rotate(-9 80 38)">
        <path
          d="M0 18 L138 0 L162 44 L144 81 L16 72 Z"
          fill="var(--color-sunken)"
          stroke="var(--color-ink)"
          strokeWidth="1.6"
        />
        <path
          d="M25 49 L105 39"
          stroke="var(--color-rule-hover)"
          strokeWidth="1.4"
        />
        <text
          x="25"
          y="38"
          fill="var(--color-ink)"
          fontFamily="var(--font-body)"
          fontSize="20"
          fontWeight="500"
        >
          120 m
        </text>
        <text
          x="107"
          y="63"
          fill="var(--color-ink-muted)"
          fontFamily="var(--font-body)"
          fontSize="12"
          textAnchor="end"
        >
          quantity
        </text>
      </g>
    </svg>
  );
}
