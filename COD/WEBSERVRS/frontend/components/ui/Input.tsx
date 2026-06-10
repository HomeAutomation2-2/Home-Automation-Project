import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  variant?: "default" | "auth";
};

const variantClasses: Record<NonNullable<InputProps["variant"]>, string> = {
  default:
    "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  auth:
    "rounded-2xl border border-ha-lowered-border bg-ha-lowered px-4 py-3 text-foreground outline-none focus:border-ha-primary focus:ring-1 focus:ring-ha-primary",
};

export function Input({
  label,
  id,
  className = "",
  error,
  variant = "default",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1 self-stretch">
      <label
        htmlFor={inputId}
        className="pl-2 text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`${variantClasses[variant]} ${error ? "border-ha-red" : ""} ${className}`}
        {...props}
      />
      {error && (
        <span
          id={`${inputId}-error`}
          className="pl-2 text-xs text-ha-red"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
