type ProcurementTransformationStructuredProps = {
  className?: string;
  titleId?: string;
};

export default function ProcurementTransformationStructured({
  className,
  titleId = "procurement-transformation-structured-title",
}: ProcurementTransformationStructuredProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 960 620"
      role="img"
      aria-labelledby={titleId}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>
        Structured procurement information organized into a procurement record.
      </title>

      <g id="structured-procurement-record" transform="translate(100 78)">
        <path
          d="M0 0 L760 0 L760 464 L0 464 Z"
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth="1.4"
        />
        <path
          d="M0 70 L760 70"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
        />
        <path
          d="M0 174 L760 174"
          stroke="var(--color-rule)"
          strokeWidth="1.3"
        />
        <path
          d="M0 278 L760 278"
          stroke="var(--color-rule)"
          strokeWidth="1.3"
        />
        <path
          d="M0 382 L760 382"
          stroke="var(--color-rule)"
          strokeWidth="1.3"
        />

        <g id="fragment-document-line-item" transform="translate(28 25)">
          <path
            d="M0 0 L112 0 L112 22 L0 22 Z"
            fill="var(--color-sunken)"
            stroke="var(--color-ink)"
            strokeWidth="1.3"
          />
          <text
            x="13"
            y="16"
            fill="var(--color-ink)"
            fontFamily="var(--font-body)"
            fontSize="12"
            fontWeight="500"
          >
            BOQ / M-04
          </text>
        </g>

        <g id="fragment-quotation" transform="translate(292 25)">
          <path
            d="M0 0 L104 0 L104 22 L0 22 Z"
            fill="var(--color-surface)"
            stroke="var(--color-rule-hover)"
            strokeWidth="1.3"
          />
          <text
            x="13"
            y="16"
            fill="var(--color-ink-muted)"
            fontFamily="var(--font-body)"
            fontSize="12"
          >
            QTN-1837
          </text>
        </g>

        <g id="fragment-supplier" transform="translate(512 25)">
          <circle cx="8" cy="11" r="5.5" fill="var(--color-accent)" />
          <path
            d="M26 11 L158 11"
            stroke="var(--color-rule-hover)"
            strokeWidth="1.4"
          />
          <text
            x="26"
            y="8"
            fill="var(--color-ink)"
            fontFamily="var(--font-body)"
            fontSize="13"
            fontWeight="500"
          >
            Gulf Ductwork
          </text>
        </g>

        <g id="fragment-boq-line-item" transform="translate(28 104)">
          <path
            d="M0 0 L704 0 L704 48 L0 48 Z"
            fill="var(--color-surface)"
            stroke="var(--color-ink)"
            strokeWidth="1.4"
          />
          <path
            d="M252 0 L252 48"
            stroke="var(--color-rule)"
            strokeWidth="1.2"
          />
          <path
            d="M380 0 L380 48"
            stroke="var(--color-rule)"
            strokeWidth="1.2"
          />
          <path
            d="M546 0 L546 48"
            stroke="var(--color-rule)"
            strokeWidth="1.2"
          />
          <text
            x="20"
            y="30"
            fill="var(--color-ink)"
            fontFamily="var(--font-body)"
            fontSize="17"
            fontWeight="500"
          >
            AHU 20,000 CFM
          </text>
          <text
            x="286"
            y="30"
            fill="var(--color-ink-muted)"
            fontFamily="var(--font-body)"
            fontSize="14"
          >
            4 units
          </text>
          <text
            x="411"
            y="30"
            fill="var(--color-ink-muted)"
            fontFamily="var(--font-body)"
            fontSize="14"
          >
            Spec line
          </text>
          <text
            x="680"
            y="30"
            fill="var(--color-accent)"
            fontFamily="var(--font-display)"
            fontSize="19"
            fontWeight="600"
            textAnchor="end"
          >
            AED 42,000
          </text>
        </g>

        <g id="structured-line-item-cable-tray" transform="translate(28 208)">
          <path
            d="M0 0 L704 0 L704 48 L0 48 Z"
            fill="var(--color-paper)"
            stroke="var(--color-rule-hover)"
            strokeWidth="1.4"
          />
          <path
            d="M252 0 L252 48"
            stroke="var(--color-rule)"
            strokeWidth="1.2"
          />
          <path
            d="M380 0 L380 48"
            stroke="var(--color-rule)"
            strokeWidth="1.2"
          />
          <path
            d="M546 0 L546 48"
            stroke="var(--color-rule)"
            strokeWidth="1.2"
          />
          <text
            x="20"
            y="30"
            fill="var(--color-ink)"
            fontFamily="var(--font-body)"
            fontSize="17"
            fontWeight="500"
          >
            Cable Tray 300mm
          </text>
          <text
            x="286"
            y="30"
            fill="var(--color-ink-muted)"
            fontFamily="var(--font-body)"
            fontSize="14"
          >
            120 m
          </text>
          <text
            x="411"
            y="30"
            fill="var(--color-ink-muted)"
            fontFamily="var(--font-body)"
            fontSize="14"
          >
            drawing ref.
          </text>
          <text
            x="680"
            y="30"
            fill="var(--color-accent)"
            fontFamily="var(--font-display)"
            fontSize="19"
            fontWeight="600"
            textAnchor="end"
          >
            AED 18,400
          </text>
        </g>

        <g id="structured-line-item-copper-pipe" transform="translate(28 312)">
          <path
            d="M0 0 L704 0 L704 48 L0 48 Z"
            fill="var(--color-sunken)"
            stroke="var(--color-rule-hover)"
            strokeWidth="1.4"
          />
          <path
            d="M252 0 L252 48"
            stroke="var(--color-rule)"
            strokeWidth="1.2"
          />
          <path
            d="M380 0 L380 48"
            stroke="var(--color-rule)"
            strokeWidth="1.2"
          />
          <path
            d="M546 0 L546 48"
            stroke="var(--color-rule)"
            strokeWidth="1.2"
          />
          <text
            x="20"
            y="30"
            fill="var(--color-ink)"
            fontFamily="var(--font-body)"
            fontSize="17"
            fontWeight="500"
          >
            Copper Pipe 50mm
          </text>
          <text
            x="286"
            y="30"
            fill="var(--color-ink-muted)"
            fontFamily="var(--font-body)"
            fontSize="14"
          >
            240 m
          </text>
          <text
            x="411"
            y="30"
            fill="var(--color-ink-muted)"
            fontFamily="var(--font-body)"
            fontSize="14"
          >
            BOQ / M-04
          </text>
          <text
            x="680"
            y="30"
            fill="var(--color-accent)"
            fontFamily="var(--font-display)"
            fontSize="19"
            fontWeight="600"
            textAnchor="end"
          >
            AED 23,100
          </text>
        </g>

        <g id="fragment-quantity" transform="translate(280 407)">
          <path
            d="M0 0 L102 0"
            stroke="var(--color-ink)"
            strokeWidth="1.3"
          />
          <text
            x="0"
            y="25"
            fill="var(--color-ink-muted)"
            fontFamily="var(--font-body)"
            fontSize="12"
          >
            quantities aligned
          </text>
        </g>

        <g id="fragment-price" transform="translate(574 407)">
          <path
            d="M0 0 L130 0"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
          />
          <text
            x="130"
            y="25"
            fill="var(--color-accent)"
            fontFamily="var(--font-body)"
            fontSize="12"
            textAnchor="end"
          >
            quoted values mapped
          </text>
        </g>
      </g>
    </svg>
  );
}
