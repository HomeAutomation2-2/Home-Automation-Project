import { FIGMA_LIGHTS } from "@/components/lights/figma-lights-assets";

type LightZoneToggleProps = {
  isOn: boolean;
  disabled?: boolean;
  busy?: boolean;
  label: string;
  onToggle: () => void;
};

export function LightZoneToggle({
  isOn,
  disabled,
  busy,
  label,
  onToggle,
}: LightZoneToggleProps) {
  const inactive = disabled || busy;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={`${label}: ${isOn ? "aprins" : "stins"}`}
      disabled={inactive}
      onClick={onToggle}
      className={`relative h-5 w-10 shrink-0 rounded-full transition-colors ${
        isOn ? "bg-[#004ac6]" : "bg-[#c3c6d7]"
      } ${inactive ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-[-4px] flex size-7 items-center justify-center rounded-full border-4 border-transparent transition-[left,right,background-color] ${
          isOn
            ? "right-[-4px] bg-[#2563eb]"
            : "left-0 bg-white shadow-sm"
        }`}
      >
        {busy ? (
          <span
            className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent"
            aria-hidden
          />
        ) : (
          isOn && (
            <img
              alt=""
              src={FIGMA_LIGHTS.toggleCheck}
              className="size-5 max-w-none"
            />
          )
        )}
      </span>
    </button>
  );
}
