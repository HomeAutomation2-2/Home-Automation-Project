import { FIGMA_ACCESS_LOG } from "@/components/access-log/figma-access-log-assets";
import { buildPageList } from "@/lib/pagination";

type AccessLogPaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
};

export function AccessLogPagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  from,
  to,
  onPageChange,
}: AccessLogPaginationProps) {
  const currentPage = totalPages < 1 ? 1 : Math.min(Math.max(1, page), totalPages);
  const pageList = buildPageList(currentPage, totalPages);
  const canPaginate = totalPages > 1;

  return (
    <div className="flex flex-col gap-3 border-t border-[#c3c6d7] bg-[#faf8ff] px-4 pb-2 pt-[9px] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] leading-4 text-[#555f6d]">
        {totalItems === 0 ? (
          "Showing 0 entries"
        ) : (
          <>
            Showing <span className="font-semibold text-[#191b23]">{from}</span> to{" "}
            <span className="font-semibold text-[#191b23]">{to}</span> of{" "}
            <span className="font-semibold text-[#191b23]">
              {totalItems.toLocaleString("en-US")}
            </span>{" "}
            entries
          </>
        )}
      </p>

      {canPaginate && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center justify-center rounded border border-[#c3c6d7] bg-white px-1.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <img alt="" src={FIGMA_ACCESS_LOG.pagePrev} className="h-[9px] w-[6px]" />
          </button>

          {pageList.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-[#555f6d]"
                aria-hidden
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={`min-w-[32px] rounded px-3 py-2 text-[13px] ${
                  item === currentPage
                    ? "bg-[#004ac6] text-white"
                    : "border border-[#c3c6d7] bg-white text-[#191b23] hover:border-[#004ac6]"
                }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center justify-center rounded border border-[#c3c6d7] bg-white px-1.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <img alt="" src={FIGMA_ACCESS_LOG.pageNext} className="h-[9px] w-[6px]" />
          </button>
        </nav>
      )}
    </div>
  );
}
