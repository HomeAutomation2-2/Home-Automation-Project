type ProfileReadonlyFieldProps = {
  label: string;
  value: string;
};

/** Câmp read-only stil Figma 212:48 — aspect input, fără editare */
export function ProfileReadonlyField({ label, value }: ProfileReadonlyFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
        {label}
      </span>
      <div className="rounded border border-[#c3c6d7] bg-[#faf8ff] px-[9px] py-[5px]">
        <p className="text-base leading-6 text-[#191b23]">{value}</p>
      </div>
    </div>
  );
}
