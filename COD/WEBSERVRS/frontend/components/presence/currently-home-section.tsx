import type { CurrentlyHomeCard } from "@/lib/presence/compute-presence-report";

type CurrentlyHomeSectionProps = {
  residents: CurrentlyHomeCard[];
};

export function CurrentlyHomeSection({ residents }: CurrentlyHomeSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold leading-7 text-[#191b23]">Currently Home</h2>
      {residents.length === 0 ? (
        <p className="mt-3 text-sm text-[#555f6d]">Nimeni acasă în acest moment.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {residents.map((resident) => (
            <div
              key={resident.userId}
              className="flex min-w-[200px] items-center gap-2 rounded border border-[#c3c6d7] bg-white py-2 pl-2 pr-6"
            >
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.15)] text-sm font-bold text-[#004ac6]">
                {resident.initials}
                <span
                  className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#10b981]"
                  aria-hidden
                />
              </span>
              <div>
                <p className="text-sm font-bold text-[#191b23]">{resident.name}</p>
                <p className="text-xs font-bold uppercase tracking-[0.6px] text-[#555f6d]">
                  {resident.sinceLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
