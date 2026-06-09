import type { InputHTMLAttributes, ReactNode } from "react";

type FigmaFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  error?: string;
  labelExtra?: ReactNode;
};

/** Câmp input conform Figma Login (border #c3c6d7, icon stânga, pl 41px) */
export function FigmaField({
  label,
  leftIcon,
  rightSlot,
  error,
  labelExtra,
  id,
  className = "",
  ...props
}: FigmaFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex w-full flex-col gap-1">
      {labelExtra ? (
        <div className="flex w-full items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-[12px] font-semibold leading-4 tracking-[0.6px] text-[#191b23]"
          >
            {label}
          </label>
          {labelExtra}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="text-[12px] font-semibold leading-4 tracking-[0.6px] text-[#191b23]"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-[2px] border border-[#c3c6d7] bg-white py-[10px] pr-2 text-[14px] text-[#191b23] outline-none placeholder:text-[#737686] focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] ${leftIcon ? "pl-[41px]" : "px-[9px]"} ${rightSlot ? "pr-[41px]" : ""} ${error ? "border-[#ba1a1a]" : ""} ${className}`}
          {...props}
        />
        {leftIcon && (
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center pl-2">
            {leftIcon}
          </div>
        )}
        {rightSlot && (
          <div className="absolute bottom-0 right-0 top-0 flex items-center pr-2">
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <p className="pl-2 text-xs text-[#ba1a1a]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
