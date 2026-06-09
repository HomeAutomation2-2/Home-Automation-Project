import { FIGMA_PRESENCE } from "@/components/presence/figma-presence-assets";
import type { UserPresenceItem } from "@/lib/types/user-presence";

export type PresenceFilterDraft = {
  search: string;
  dateFrom: string;
  dateTo: string;
  userId: string;
};

type PresenceFiltersBarProps = {
  draft: PresenceFilterDraft;
  onChange: (next: PresenceFilterDraft) => void;
  onApply: () => void;
  users: UserPresenceItem[];
  showUserSelect: boolean;
};

export function PresenceFiltersBar({
  draft,
  onChange,
  onApply,
  users,
  showUserSelect,
}: PresenceFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#c3c6d7] bg-[#faf8ff] px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <h2 className="text-lg font-semibold leading-7 text-[#191b23]">Jurnal activitate</h2>
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative">
          <img
            alt=""
            src={FIGMA_PRESENCE.searchIcon}
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2"
          />
          <input
            type="search"
            placeholder="Caută utilizator…"
            value={draft.search}
            onChange={(e) => onChange({ ...draft, search: e.target.value })}
            className="w-48 rounded border border-[#c3c6d7] bg-white py-1.5 pl-8 pr-3 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
          />
        </div>

        <div className="flex items-center gap-1">
          <img alt="" src={FIGMA_PRESENCE.calendarIcon} className="size-3.5" />
          <input
            type="date"
            value={draft.dateFrom}
            onChange={(e) => onChange({ ...draft, dateFrom: e.target.value })}
            aria-label="De la"
            className="rounded border border-[#c3c6d7] bg-white px-2 py-1.5 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
          />
          <span className="text-[#555f6d]">–</span>
          <input
            type="date"
            value={draft.dateTo}
            onChange={(e) => onChange({ ...draft, dateTo: e.target.value })}
            aria-label="Până la"
            className="rounded border border-[#c3c6d7] bg-white px-2 py-1.5 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
          />
        </div>

        {showUserSelect && (
          <div className="relative">
            <select
              value={draft.userId}
              onChange={(e) => onChange({ ...draft, userId: e.target.value })}
              aria-label="Filtru utilizator"
              className="appearance-none rounded border border-[#c3c6d7] bg-white py-1.5 pl-2 pr-8 text-sm text-[#191b23] outline-none focus:border-[#004ac6]"
            >
              <option value="">Toți utilizatorii</option>
              {users.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.first_name} {u.last_name}
                </option>
              ))}
            </select>
            <img
              alt=""
              src={FIGMA_PRESENCE.selectChevron}
              className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2"
            />
          </div>
        )}

        <button
          type="button"
          onClick={onApply}
          className="rounded border border-[#c3c6d7] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.6px] text-[#191b23] hover:bg-[#faf8ff]"
        >
          Aplică
        </button>
      </div>
    </div>
  );
}
