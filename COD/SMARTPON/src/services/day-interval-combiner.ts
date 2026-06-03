const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;


export function formatDays(days: number[]): string 
{
  // Remove duplicates and sort
  const sorted = [...new Set(days)].sort((a, b) => a - b);

  const parts: string[] = [];
  let i = 0;

  while (i < sorted.length) {
    let start = sorted[i];
    let end = start;

    // Find consecutive sequence
    while (
      i + 1 < sorted.length &&
      sorted[i + 1] === sorted[i] + 1
    ) {
      i++;
      end = sorted[i];
    }

    const length = end - start + 1;

    if (length >= 3) {
      // 3+ consecutive days → range
      parts.push(`${DAY_NAMES[start]} - ${DAY_NAMES[end]}`);
    } else if (length === 2) {
      // exactly 2 consecutive days → keep separate
      parts.push(DAY_NAMES[start], DAY_NAMES[end]);
    } else {
      // single day
      parts.push(DAY_NAMES[start]);
    }

    i++;
  }

  return parts.join(", ");
}