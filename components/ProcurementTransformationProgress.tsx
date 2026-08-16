import ProcurementTransformation from "@/components/ProcurementTransformation";
import ProcurementIntelligence from "@/components/ProcurementIntelligence";
import ProcurementTransformationStructured from "@/components/ProcurementTransformationStructured";

type ProcurementTransformationProgressProps = {
  className?: string;
  progress: number;
  titleId?: string;
};

type TransformPoint = {
  x: number;
  y: number;
  rotation: number;
  originX: number;
  originY: number;
};

type Point = {
  x: number;
  y: number;
};

type Relationship = {
  id: string;
  from: Point;
  to: Point;
  bend: number;
  start: number;
  end: number;
  accent?: boolean;
};

const fragmentTransforms = {
  boqLineItem: {
    from: { x: 72, y: 92, rotation: -5, originX: 190, originY: 42 },
    to: { x: 128, y: 182, rotation: 0, originX: 190, originY: 42 },
  },
  supplier: {
    from: { x: 690, y: 232, rotation: 7, originX: 98, originY: 46 },
    to: { x: 612, y: 103, rotation: 0, originX: 98, originY: 46 },
  },
  documentLineItem: {
    from: { x: 392, y: 404, rotation: 3, originX: 72, originY: 104 },
    to: { x: 128, y: 103, rotation: 0, originX: 72, originY: 104 },
  },
  quotation: {
    from: { x: 548, y: 78, rotation: -4, originX: 132, originY: 62 },
    to: { x: 392, y: 103, rotation: 0, originX: 132, originY: 62 },
  },
  price: {
    from: { x: 606, y: 430, rotation: 4, originX: 104, originY: 44 },
    to: { x: 674, y: 182, rotation: 0, originX: 104, originY: 44 },
  },
  quantity: {
    from: { x: 132, y: 350, rotation: -9, originX: 80, originY: 38 },
    to: { x: 380, y: 182, rotation: 0, originX: 80, originY: 38 },
  },
} satisfies Record<string, { from: TransformPoint; to: TransformPoint }>;

function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, progress));
}

function easeInOut(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function smoothStep(edgeStart: number, edgeEnd: number, progress: number) {
  const normalized = clampProgress((progress - edgeStart) / (edgeEnd - edgeStart));

  return normalized * normalized * (3 - 2 * normalized);
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function transformBetween(
  from: TransformPoint,
  to: TransformPoint,
  progress: number,
) {
  const x = interpolate(from.x, to.x, progress);
  const y = interpolate(from.y, to.y, progress);
  const rotation = interpolate(from.rotation, to.rotation, progress);

  return `translate(${x} ${y}) rotate(${rotation} ${from.originX} ${from.originY})`;
}

function pointBetween(
  from: TransformPoint,
  to: TransformPoint,
  progress: number,
  anchor: Point,
) {
  return {
    x: interpolate(from.x, to.x, progress) + anchor.x,
    y: interpolate(from.y, to.y, progress) + anchor.y,
  };
}

function relationshipPath(from: Point, to: Point, bend = 0) {
  const midpointX = (from.x + to.x) / 2;

  return [
    `M${from.x} ${from.y}`,
    `C${midpointX} ${from.y + bend}`,
    `${midpointX} ${to.y - bend}`,
    `${to.x} ${to.y}`,
  ].join(" ");
}

function relationshipPoint(from: Point, to: Point, bend: number, progress: number) {
  const midpointX = (from.x + to.x) / 2;
  const controlA = { x: midpointX, y: from.y + bend };
  const controlB = { x: midpointX, y: to.y - bend };
  const inverse = 1 - progress;

  return {
    x:
      inverse * inverse * inverse * from.x +
      3 * inverse * inverse * progress * controlA.x +
      3 * inverse * progress * progress * controlB.x +
      progress * progress * progress * to.x,
    y:
      inverse * inverse * inverse * from.y +
      3 * inverse * inverse * progress * controlA.y +
      3 * inverse * progress * progress * controlB.y +
      progress * progress * progress * to.y,
  };
}

function RelationshipPath({
  progress,
  relationship,
  resolveEnd = 0.99,
  resolveStart = 0.9,
}: {
  progress: number;
  relationship: Relationship;
  resolveEnd?: number;
  resolveStart?: number;
}) {
  const drawProgress = smoothStep(
    relationship.start,
    relationship.end,
    progress,
  );
  const resolveProgress = 1 - smoothStep(resolveStart, resolveEnd, progress);
  const pathOpacity = (relationship.accent ? 0.42 : 0.34) * resolveProgress;
  const isActive = drawProgress > 0 && drawProgress < 1 && resolveProgress > 0;
  const activePoint = relationshipPoint(
    relationship.from,
    relationship.to,
    relationship.bend,
    drawProgress,
  );

  return (
    <>
      <path
        d={relationshipPath(
          relationship.from,
          relationship.to,
          relationship.bend,
        )}
        fill="none"
        pathLength={1}
        stroke={
          relationship.accent ? "var(--color-accent)" : "var(--color-rule-hover)"
        }
        strokeDasharray="1"
        strokeDashoffset={1 - drawProgress}
        strokeLinecap="round"
        strokeWidth={relationship.accent ? 1.15 : 1.2}
        opacity={pathOpacity}
      />
      {isActive && (
        <circle
          cx={activePoint.x}
          cy={activePoint.y}
          r="2.4"
          fill={
            relationship.accent
              ? "var(--color-accent)"
              : "var(--color-ink-muted)"
          }
          opacity={relationship.accent ? 0.5 : 0.42}
        />
      )}
    </>
  );
}

function AnalysisLayer({
  fragmentProgress,
  progress,
}: {
  fragmentProgress: number;
  progress: number;
}) {
  if (progress < 0.12 || progress > 0.68) {
    return null;
  }

  const boq = pointBetween(
    fragmentTransforms.boqLineItem.from,
    fragmentTransforms.boqLineItem.to,
    fragmentProgress,
    { x: 190, y: 46 },
  );
  const supplier = pointBetween(
    fragmentTransforms.supplier.from,
    fragmentTransforms.supplier.to,
    fragmentProgress,
    { x: 32, y: 31 },
  );
  const quotation = pointBetween(
    fragmentTransforms.quotation.from,
    fragmentTransforms.quotation.to,
    fragmentProgress,
    { x: 31, y: 35 },
  );
  const price = pointBetween(
    fragmentTransforms.price.from,
    fragmentTransforms.price.to,
    fragmentProgress,
    { x: 25, y: 39 },
  );
  const quantity = pointBetween(
    fragmentTransforms.quantity.from,
    fragmentTransforms.quantity.to,
    fragmentProgress,
    { x: 75, y: 38 },
  );
  const documentLineItem = pointBetween(
    fragmentTransforms.documentLineItem.from,
    fragmentTransforms.documentLineItem.to,
    fragmentProgress,
    { x: 76, y: 95 },
  );
  const intelligence = { x: 480, y: 310 };

  const analysisRelationships: Relationship[] = [
    {
      id: "analysis-document",
      from: documentLineItem,
      to: intelligence,
      bend: 18,
      start: 0.14,
      end: 0.28,
    },
    {
      id: "analysis-boq",
      from: boq,
      to: intelligence,
      bend: 20,
      start: 0.22,
      end: 0.36,
    },
    {
      id: "analysis-quantity",
      from: quantity,
      to: intelligence,
      bend: -24,
      start: 0.3,
      end: 0.44,
    },
    {
      id: "analysis-quotation",
      from: quotation,
      to: intelligence,
      bend: -20,
      start: 0.38,
      end: 0.52,
    },
    {
      id: "analysis-supplier",
      from: supplier,
      to: intelligence,
      bend: -18,
      start: 0.46,
      end: 0.6,
    },
    {
      id: "analysis-price",
      from: price,
      to: intelligence,
      bend: 22,
      start: 0.52,
      end: 0.66,
      accent: true,
    },
  ];

  return (
    <g id="analysis-layer" pointerEvents="none" aria-hidden="true">
      {analysisRelationships.map((relationship) => (
        <RelationshipPath
          progress={progress}
          relationship={relationship}
          resolveStart={0.62}
          resolveEnd={0.74}
          key={relationship.id}
        />
      ))}
    </g>
  );
}

function RelationshipLayer({
  fragmentProgress,
  progress,
}: {
  fragmentProgress: number;
  progress: number;
}) {
  const easedProgress = fragmentProgress;

  if (progress < 0.5 || progress > 0.99) {
    return null;
  }

  const boq = pointBetween(
    fragmentTransforms.boqLineItem.from,
    fragmentTransforms.boqLineItem.to,
    easedProgress,
    { x: 190, y: 46 },
  );
  const supplier = pointBetween(
    fragmentTransforms.supplier.from,
    fragmentTransforms.supplier.to,
    easedProgress,
    { x: 32, y: 31 },
  );
  const quotation = pointBetween(
    fragmentTransforms.quotation.from,
    fragmentTransforms.quotation.to,
    easedProgress,
    { x: 31, y: 35 },
  );
  const price = pointBetween(
    fragmentTransforms.price.from,
    fragmentTransforms.price.to,
    easedProgress,
    { x: 25, y: 39 },
  );
  const quantity = pointBetween(
    fragmentTransforms.quantity.from,
    fragmentTransforms.quantity.to,
    easedProgress,
    { x: 75, y: 38 },
  );
  const documentLineItem = pointBetween(
    fragmentTransforms.documentLineItem.from,
    fragmentTransforms.documentLineItem.to,
    easedProgress,
    { x: 76, y: 95 },
  );

  const relationships: Relationship[] = [
    {
      id: "boq-to-document",
      from: boq,
      to: documentLineItem,
      bend: -22,
      start: 0.5,
      end: 0.6,
    },
    {
      id: "boq-to-quantity",
      from: boq,
      to: quantity,
      bend: 18,
      start: 0.56,
      end: 0.66,
    },
    {
      id: "boq-to-quotation",
      from: boq,
      to: quotation,
      bend: 26,
      start: 0.62,
      end: 0.72,
    },
    {
      id: "quotation-to-supplier",
      from: quotation,
      to: supplier,
      bend: -18,
      start: 0.68,
      end: 0.78,
    },
    {
      id: "quotation-to-price",
      from: quotation,
      to: price,
      bend: 22,
      start: 0.74,
      end: 0.84,
      accent: true,
    },
  ];

  return (
    <g
      id="relationship-layer"
      pointerEvents="none"
      aria-hidden="true"
    >
      {relationships.map((relationship) => (
        <RelationshipPath
          progress={progress}
          relationship={relationship}
          key={relationship.id}
        />
      ))}
    </g>
  );
}

function ContextualLabelLayer({ progress }: { progress: number }) {
  const analysisOpacity =
    0.72 * smoothStep(0.12, 0.2, progress) * (1 - smoothStep(0.64, 0.7, progress));
  const establishedOpacity =
    0.72 * smoothStep(0.78, 0.84, progress) * (1 - smoothStep(0.91, 0.94, progress));

  if (analysisOpacity <= 0 && establishedOpacity <= 0) {
    return null;
  }

  return (
    <g
      id="contextual-relationship-label"
      pointerEvents="none"
      aria-hidden="true"
    >
      <text
        x="100"
        y="54"
        fill="var(--color-ink-muted)"
        fontFamily="var(--font-body)"
        fontSize="13"
        opacity={analysisOpacity}
      >
        Analyzing procurement information
      </text>
      <text
        x="100"
        y="54"
        fill="var(--color-ink-muted)"
        fontFamily="var(--font-body)"
        fontSize="13"
        opacity={establishedOpacity}
      >
        Relationships established
      </text>
    </g>
  );
}

function IntelligenceLayer({ progress }: { progress: number }) {
  const enterOpacity = smoothStep(0.05, 0.16, progress);
  const exitOpacity = 1 - smoothStep(0.88, 0.99, progress);
  const opacity = 0.92 * enterOpacity * exitOpacity;
  const scale = 0.86 + 0.14 * enterOpacity;
  const y = interpolate(332, 310, enterOpacity);

  if (opacity <= 0) {
    return null;
  }

  return (
    <g id="intelligence-layer" pointerEvents="none" aria-hidden="true">
      <ProcurementIntelligence opacity={opacity} scale={scale} y={y} />
    </g>
  );
}

function StructuredResolutionLayer({ progress }: { progress: number }) {
  const recordOpacity = 0.78 * smoothStep(0.93, 0.99, progress);
  const detailOpacity = 0.5 * smoothStep(0.965, 0.998, progress);

  if (recordOpacity <= 0) {
    return null;
  }

  return (
    <g
      id="structured-resolution-layer"
      pointerEvents="none"
      aria-hidden="true"
    >
      <g opacity={recordOpacity}>
        <path
          d="M100 78 L860 78 L860 542 L100 542 Z"
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth="1.4"
        />
        <path
          d="M100 148 L860 148"
          stroke="var(--color-ink)"
          strokeWidth="1.2"
        />
        <path
          d="M100 252 L860 252"
          stroke="var(--color-rule)"
          strokeWidth="1.2"
        />
        <path
          d="M100 356 L860 356"
          stroke="var(--color-rule)"
          strokeWidth="1.2"
        />
        <path
          d="M100 460 L860 460"
          stroke="var(--color-rule)"
          strokeWidth="1.2"
        />
      </g>

      <g opacity={detailOpacity}>
        <path
          d="M380 182 L380 230"
          stroke="var(--color-rule)"
          strokeWidth="1.1"
        />
        <path
          d="M508 182 L508 230"
          stroke="var(--color-rule)"
          strokeWidth="1.1"
        />
        <path
          d="M674 182 L674 230"
          stroke="var(--color-rule)"
          strokeWidth="1.1"
        />
        <path
          d="M128 252 L832 252"
          stroke="var(--color-rule-hover)"
          strokeWidth="1.1"
        />
        <path
          d="M128 356 L832 356"
          stroke="var(--color-rule)"
          strokeWidth="1.1"
        />
        <text
          x="128"
          y="132"
          fill="var(--color-ink-muted)"
          fontFamily="var(--font-body)"
          fontSize="11"
        >
          source
        </text>
        <text
          x="392"
          y="132"
          fill="var(--color-ink-muted)"
          fontFamily="var(--font-body)"
          fontSize="11"
        >
          quotation
        </text>
        <text
          x="612"
          y="132"
          fill="var(--color-ink-muted)"
          fontFamily="var(--font-body)"
          fontSize="11"
        >
          supplier
        </text>
      </g>
    </g>
  );
}

export default function ProcurementTransformationProgress({
  className,
  progress,
  titleId = "procurement-transformation-progress-title",
}: ProcurementTransformationProgressProps) {
  const normalizedProgress = clampProgress(progress);

  if (normalizedProgress === 0) {
    return <ProcurementTransformation className={className} titleId={titleId} />;
  }

  if (normalizedProgress === 1) {
    return (
      <ProcurementTransformationStructured
        className={className}
        titleId={titleId}
      />
    );
  }

  const fragmentProgress = easeInOut(smoothStep(0.74, 0.995, normalizedProgress));

  return (
    <svg
      className={className}
      viewBox="0 0 960 620"
      role="img"
      aria-labelledby={titleId}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>
        Procurement information fragments moving into structured alignment.
      </title>

      <StructuredResolutionLayer progress={normalizedProgress} />

      <g
        id="fragment-boq-line-item"
        transform={transformBetween(
          fragmentTransforms.boqLineItem.from,
          fragmentTransforms.boqLineItem.to,
          fragmentProgress,
        )}
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

      <g
        id="fragment-supplier"
        transform={transformBetween(
          fragmentTransforms.supplier.from,
          fragmentTransforms.supplier.to,
          fragmentProgress,
        )}
      >
        <path
          d="M14 0 L184 10 L196 72 L172 94 L18 82 L0 36 Z"
          fill="var(--color-paper)"
          stroke="var(--color-ink)"
          strokeWidth="1.6"
        />
        <circle cx="32" cy="31" r="7" fill="var(--color-accent)" />
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
        transform={transformBetween(
          fragmentTransforms.documentLineItem.from,
          fragmentTransforms.documentLineItem.to,
          fragmentProgress,
        )}
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

      <g
        id="fragment-quotation"
        transform={transformBetween(
          fragmentTransforms.quotation.from,
          fragmentTransforms.quotation.to,
          fragmentProgress,
        )}
      >
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

      <g
        id="fragment-price"
        transform={transformBetween(
          fragmentTransforms.price.from,
          fragmentTransforms.price.to,
          fragmentProgress,
        )}
      >
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

      <g
        id="fragment-quantity"
        transform={transformBetween(
          fragmentTransforms.quantity.from,
          fragmentTransforms.quantity.to,
          fragmentProgress,
        )}
      >
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

      <AnalysisLayer
        fragmentProgress={fragmentProgress}
        progress={normalizedProgress}
      />
      <RelationshipLayer
        fragmentProgress={fragmentProgress}
        progress={normalizedProgress}
      />
      <IntelligenceLayer progress={normalizedProgress} />
      <ContextualLabelLayer progress={normalizedProgress} />
    </svg>
  );
}
