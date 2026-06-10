import type { TemperaturePoint } from "@/lib/temperature/types";

type TemperatureChartProps = {
  points: TemperaturePoint[];
  roomName?: string;
};

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 20, right: 20, bottom: 48, left: 52 };

type ChartScale = {
  min: number;
  max: number;
  yTicks: number[];
};

function buildScale(values: number[]): ChartScale {
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max(0.5, (rawMax - rawMin) * 0.1 || 1);
  const min = Math.floor((rawMin - padding) * 2) / 2;
  const max = Math.ceil((rawMax + padding) * 2) / 2;
  const span = max - min || 1;
  const step = span <= 2 ? 0.5 : span <= 6 ? 1 : span <= 12 ? 2 : 5;
  const ticks: number[] = [];
  for (let v = min; v <= max + step * 0.01; v += step) {
    ticks.push(Math.round(v * 10) / 10);
  }
  if (ticks.length < 2) {
    ticks.push(min, max);
  }
  return { min, max, yTicks: ticks };
}

function chartCoords(
  points: TemperaturePoint[],
  index: number,
  scale: ChartScale,
): { x: number; y: number } {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const span = scale.max - scale.min || 1;

  const x =
    points.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (index / (points.length - 1)) * innerW;

  const y =
    PAD.top + innerH - ((points[index].value - scale.min) / span) * innerH;
  return { x, y };
}

function yToPx(value: number, scale: ChartScale): number {
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const span = scale.max - scale.min || 1;
  return PAD.top + innerH - ((value - scale.min) / span) * innerH;
}

/** Max ~7 etichete pe axa X, fără suprapunere. */
function xTickIndices(count: number, maxTicks = 7): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  const n = Math.min(maxTicks, count);
  const indices: number[] = [];
  for (let i = 0; i < n; i++) {
    indices.push(Math.round((i / (n - 1)) * (count - 1)));
  }
  return [...new Set(indices)].sort((a, b) => a - b);
}

function formatXLabel(iso: string, spanHours: number): string {
  const date = new Date(iso);
  if (spanHours <= 36) {
    return date.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
  }
  if (spanHours <= 24 * 8) {
    return date.toLocaleString("ro-RO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
    });
  }
  return date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export function TemperatureChart({ points, roomName }: TemperatureChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded border border-dashed border-[#c3c6d7] bg-[#faf8ff] text-sm text-[#555f6d]">
        Nicio măsurătoare pentru intervalul selectat.
      </div>
    );
  }

  const scale = buildScale(points.map((p) => p.value));
  const spanHours =
    points.length >= 2
      ? (new Date(points[points.length - 1].time).getTime() -
          new Date(points[0].time).getTime()) /
        3_600_000
      : 0;
  const xTicks = xTickIndices(points.length);
  const showDots = points.length <= 48;

  const polyline =
    points.length > 1
      ? points
          .map((_, i) => {
            const { x, y } = chartCoords(points, i, scale);
            return `${x},${y}`;
          })
          .join(" ")
      : null;

  const single = points.length === 1 ? chartCoords(points, 0, scale) : null;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="min-w-[320px] w-full max-w-full"
        role="img"
        aria-label={
          roomName
            ? `Grafic temperatură ${roomName}`
            : "Grafic evoluție temperatură"
        }
      >
        {/* grilă orizontală + etichete Y (°C) */}
        {scale.yTicks.map((tick) => {
          const y = yToPx(tick, scale);
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={WIDTH - PAD.right}
                y2={y}
                stroke="#e8eaf0"
                strokeWidth={1}
                strokeDasharray={tick === scale.min || tick === scale.max ? "0" : "4 3"}
              />
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-[#555f6d] text-[10px]"
              >
                {tick % 1 === 0 ? `${tick}°C` : `${tick.toFixed(1)}°C`}
              </text>
            </g>
          );
        })}

        {/* axe */}
        <line
          x1={PAD.left}
          y1={HEIGHT - PAD.bottom}
          x2={WIDTH - PAD.right}
          y2={HEIGHT - PAD.bottom}
          stroke="#c3c6d7"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={HEIGHT - PAD.bottom}
          stroke="#c3c6d7"
          strokeWidth={1}
        />

        {polyline && (
          <polyline
            fill="none"
            stroke="#004ac6"
            strokeWidth={2}
            points={polyline}
          />
        )}

        {showDots &&
          points.map((point, i) => {
            const { x, y } = chartCoords(points, i, scale);
            return (
              <circle
                key={`${point.time}-${i}`}
                cx={x}
                cy={y}
                r={4}
                fill="#004ac6"
              />
            );
          })}

        {/* etichete X — doar la tick-uri selectate */}
        {xTicks.map((idx) => {
          const { x } = chartCoords(points, idx, scale);
          return (
            <text
              key={`x-${idx}`}
              x={x}
              y={HEIGHT - PAD.bottom + 18}
              textAnchor="middle"
              className="fill-[#555f6d] text-[10px]"
            >
              {formatXLabel(points[idx].time, spanHours)}
            </text>
          );
        })}

        {single && (
          <>
            <circle cx={single.x} cy={single.y} r={5} fill="#004ac6" />
            <text
              x={single.x}
              y={single.y - 12}
              textAnchor="middle"
              className="fill-[#191b23] text-[11px] font-semibold"
            >
              {points[0].value.toFixed(1)}°C
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
