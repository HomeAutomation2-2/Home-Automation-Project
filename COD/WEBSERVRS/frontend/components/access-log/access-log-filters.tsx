import { FIGMA_ACCESS_LOG } from "@/components/access-log/figma-access-log-assets";

export type AccessLogFilterDraft = {
  search: string;
  dateFrom: string;
  dateTo: string;
  userRole: "all" | "admin" | "user";
  eventResult: "all" | "entry" | "exit";
};

type AccessLogFiltersProps = {
  draft: AccessLogFilterDraft;
  onChange: (next: AccessLogFilterDraft) => void;
  onApply: () => void;
};

function FilterLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.6px] text-[#555f6d]">
      {children}
    </span>
  );
}

function FilterInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded border border-[#c3c6d7] bg-[#faf8ff] px-2 py-1.5 text-sm text-[#191b23] outline-none focus:border-[#004ac6] ${className}`}
      {...props}
    />
  );
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded border border-[#c3c6d7] bg-[#faf8ff] px-2 py-1.5 pr-8 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
      >
        {children}
      </select>
      <img
        alt=""
        src={FIGMA_ACCESS_LOG.selectChevron}
        className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2"
      />
    </div>
  );
}

export function AccessLogFilters({ draft, onChange, onApply }: AccessLogFiltersProps) {
  return (
    <div className="rounded border border-[#c3c6d7] bg-white p-[17px] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.02)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
        <div className="relative md:col-span-4">
          <FilterLabel>Căutare</FilterLabel>
          <div className="relative mt-1">
            <img
              alt=""
              src={FIGMA_ACCESS_LOG.searchIcon}
              className="pointer-events-none absolute left-2.5 top-1/2 size-[15px] -translate-y-1/2"
            />
            <FilterInput
              type="search"
              placeholder="Nume sau identificator…"
              value={draft.search}
              onChange={(e) => onChange({ ...draft, search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <FilterLabel>Interval</FilterLabel>
          <div className="mt-1 flex items-center gap-2">
            <FilterInput
              type="date"
              value={draft.dateFrom}
              onChange={(e) => onChange({ ...draft, dateFrom: e.target.value })}
              aria-label="De la"
            />
            <span className="text-[#555f6d]">-</span>
            <FilterInput
              type="date"
              value={draft.dateTo}
              onChange={(e) => onChange({ ...draft, dateTo: e.target.value })}
              aria-label="Până la"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <FilterLabel>Rol</FilterLabel>
          <div className="mt-1">
            <FilterSelect
              value={draft.userRole}
              onChange={(v) =>
                onChange({ ...draft, userRole: v as AccessLogFilterDraft["userRole"] })
              }
            >
              <option value="all">Toate rolurile</option>
              <option value="admin">Administrator</option>
              <option value="user">Utilizator</option>
            </FilterSelect>
          </div>
        </div>

        <div className="md:col-span-2">
          <FilterLabel>Tip eveniment</FilterLabel>
          <div className="mt-1">
            <FilterSelect
              value={draft.eventResult}
              onChange={(v) =>
                onChange({ ...draft, eventResult: v as AccessLogFilterDraft["eventResult"] })
              }
            >
              <option value="all">Toate</option>
              <option value="entry">Intrare</option>
              <option value="exit">Ieșire</option>
            </FilterSelect>
          </div>
        </div>

        <div className="md:col-span-1">
          <button
            type="button"
            onClick={onApply}
            className="w-full rounded border border-[#c3c6d7] bg-[#ededf9] px-4 py-2 text-sm text-[#191b23] hover:bg-[#e4e4f5]"
          >
            Filtrează
          </button>
        </div>
      </div>
    </div>
  );
}
