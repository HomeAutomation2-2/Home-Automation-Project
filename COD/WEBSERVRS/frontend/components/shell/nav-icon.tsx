type NavIconProps = {
  src: string;
  /** clase dimensiune, ex. size-[15px] */
  className: string;
  active: boolean;
};

/**
 * Iconiță meniu lateral: #004ac6 când ruta e activă, #555f6d altfel (inclusiv la hover).
 */
export function NavIcon({ src, className, active }: NavIconProps) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 max-w-none ${className} ${
        active ? "bg-[#004ac6]" : "bg-[#555f6d] group-hover:bg-[#434655]"
      }`}
      style={{
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
