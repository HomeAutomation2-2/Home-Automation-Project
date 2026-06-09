import type { TemperaturePoint } from "@/lib/temperature/types";

type TemperatureChartProps = {
  points: TemperaturePoint[];
  roomName?: string;
};

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 24, right: 24, bottom: 40, left: 48 };

function chartCoords(
  points: TemperaturePoint[],
  index: number,
): { x: number; y: number } {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const values = points.map((p) => p.value);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const span = max - min || 1;

  const x =
    points.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (index / (points.length - 1)) * innerW;

  const y = PAD.top + innerH - ((points[index].value - min) / span) * innerH;
  return { x, y };
}

/**
 * Grafic SVG simplu — fără dependență recharts (MVP: 1+ puncte, ușor de înlocuit
 * când vine GET /temperature-readings).
 */
export function TemperatureChart({ points, roomName }: TemperatureChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded border border-dashed border-[#c3c6d7] bg-[#faf8ff] text-sm text-[#555f6d]">
        Nicio măsurătoare pentru intervalul selectat.
      </div>
    );
  }

  const polyline =
    points.length > 1
      ? points
          .map((_, i) => {
            const { x, y } = chartCoords(points, i);
            return `${x},${y}`;
          })
          .join(" ")
      : null;

  const single = points.length === 1 ? chartCoords(points, 0) : null;

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

        {points.map((point, i) => {
          const { x, y } = chartCoords(points, i);
          return (
            <g key={`${point.time}-${i}`}>
              <circle cx={x} cy={y} r={5} fill="#004ac6" />
              <text
                x={x}
                y={HEIGHT - PAD.bottom + 16}
                textAnchor="middle"
                className="fill-[#555f6d] text-[10px]"
              >
                {point.label}
              </text>
            </g>
          );
        })}

        {single && (
          <text
            x={single.x}
            y={single.y - 12}
            textAnchor="middle"
            className="fill-[#191b23] text-[11px] font-semibold"
          >
            {points[0].value.toFixed(1)}°C
          </text>
        )}
      </svg>
    </div>
  );
}
