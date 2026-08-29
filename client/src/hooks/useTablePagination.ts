import { useEffect, useMemo, useState } from 'react';

export function useTablePagination<T>(items: T[]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  const start = (page - 1) * pageSize;
  const rows = useMemo(() => items.slice(start, start + pageSize), [items, start, pageSize]);

  return { rows, page, setPage, pageSize, setPageSize, pageCount, start, total: items.length };
}

export type TablePaginationState<T> = ReturnType<typeof useTablePagination<T>>;
