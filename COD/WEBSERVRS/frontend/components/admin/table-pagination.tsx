type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
};

function buildPageList(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (current < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  pageSizeOptions = [5, 10, 15],
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);
  const pageList = buildPageList(safePage, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-[#c3c6d7] bg-[#faf8ff] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#555f6d]">
        {totalItems === 0 ? (
          "0 utilizatori"
        ) : (
          <>
            Afișare <span className="font-medium text-[#191b23]">{from}–{to}</span> din{" "}
            <span className="font-medium text-[#191b23]">{totalItems}</span> utilizatori
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-[#555f6d]">
            Rânduri
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-[#c3c6d7] bg-white px-2 py-1 text-sm text-[#191b23]"
              aria-label="Rânduri per pagină"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}

        <nav
          className="flex items-center gap-1"
          aria-label="Paginare tabel"
        >
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            className="rounded border border-[#c3c6d7] bg-white px-3 py-1.5 text-sm font-medium text-[#191b23] hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          {pageList.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-[#737686]"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === safePage ? "page" : undefined}
                className={`min-w-[36px] rounded border px-2 py-1.5 text-sm font-medium ${
                  item === safePage
                    ? "border-[#004ac6] bg-[#004ac6] text-white"
                    : "border-[#c3c6d7] bg-white text-[#191b23] hover:border-[#004ac6] hover:text-[#004ac6]"
                }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            className="rounded border border-[#c3c6d7] bg-white px-3 py-1.5 text-sm font-medium text-[#191b23] hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Următor
          </button>
        </nav>
      </div>
    </div>
  );
}
