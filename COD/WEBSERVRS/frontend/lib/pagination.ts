export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0 || pageSize <= 0) return 0;
  return Math.ceil(totalItems / pageSize);
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(1, page), totalPages);
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): { currentPage: number; totalPages: number; rows: T[]; from: number; to: number } {
  const totalPages = getTotalPages(items.length, pageSize);
  const currentPage = clampPage(page, totalPages);
  const from =
    items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = items.length === 0 ? 0 : Math.min(currentPage * pageSize, items.length);
  const rows = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return { currentPage, totalPages, rows, from, to };
}

export function buildPageList(
  current: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let p = start; p <= end; p += 1) {
    if (!pages.includes(p)) pages.push(p);
  }
  if (current < totalPages - 2) pages.push("ellipsis");
  if (!pages.includes(totalPages)) pages.push(totalPages);
  return pages;
}
