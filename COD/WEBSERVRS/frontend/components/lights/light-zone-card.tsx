"use client";

import { FIGMA_LIGHTS } from "@/components/lights/figma-lights-assets";
import { LightZoneToggle } from "@/components/lights/light-zone-toggle";
import { useLiveClock } from "@/hooks/useLiveClock";
import { formatLastChanged } from "@/lib/lights/format-last-changed";
import type { LightZoneForDisplay } from "@/lib/lights/join-light-zones";

type LightZoneCardProps = {
  zone: LightZoneForDisplay;
  busy?: boolean;
  error?: string | null;
  onToggle: () => void;
};

export function LightZoneCard({ zone, busy, error, onToggle }: LightZoneCardProps) {
  const now = useLiveClock(30_000);
  const lastChanged = formatLastChanged(zone.last_changed_at, now);

  return (
    <article
      className={`relative flex min-h-[189px] flex-col gap-4 overflow-hidden rounded border bg-white p-[17px] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.02)] ${
        error ? "border-[#b42318]" : "border-[#c3c6d7]"
      }`}
    >
      {zone.is_on && (
        <span
          className="absolute bottom-0 left-0 top-0 w-1 bg-[#004ac6]"
          aria-hidden
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#dbe1ff]">
          <img alt="" src={FIGMA_LIGHTS.bulbIcon} className="h-5 w-[15px] max-w-none" />
        </span>
        <LightZoneToggle
          isOn={zone.is_on}
          busy={busy}
          label={zone.name}
          onToggle={onToggle}
        />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-[#191b23]">{zone.name}</h3>
        <p className="text-xs text-[#555f6d]">{zone.room_name}</p>
        <p
          className={`text-xs font-semibold uppercase tracking-[0.6px] ${
            zone.is_on ? "text-[#004ac6]" : "text-[#555f6d]"
          }`}
        >
          {zone.is_on ? "Activ • 100%" : "Inactiv • 0%"}
        </p>
        {error && (
          <p className="text-xs text-[#b42318]" role="alert">
            {error}
          </p>
        )}
      </div>

      {lastChanged && (
        <div className="flex items-center justify-between border-t border-[#c3c6d7] pt-4">
          <div className="flex items-center gap-1 text-[13px] text-[#555f6d]">
            <img alt="" src={FIGMA_LIGHTS.clockIcon} className="size-3 max-w-none" />
            <span>Ultima activitate</span>
          </div>
          <span className="text-[13px] text-[#555f6d]">{lastChanged}</span>
        </div>
      )}
    </article>
  );
}
