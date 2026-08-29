import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TablePaginationState } from '../../hooks/useTablePagination';

export function TablePagination({ page, setPage, pageSize, setPageSize, pageCount, start, total }: TablePaginationState<unknown>) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-gray-200 bg-white px-4 py-2.5 text-[10px] text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span>Mostrando {start + 1}–{Math.min(start + pageSize, total)} de {total} registros</span>
        <label className="flex items-center gap-1.5">
          <span>Filas</span>
          <select
            aria-label="Filas por página"
            value={pageSize}
            onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-700 outline-none focus:border-[#e6b010]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" aria-label="Página anterior" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))} className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-16 text-center font-medium text-gray-700">Página {page} de {pageCount}</span>
        <button type="button" aria-label="Página siguiente" disabled={page >= pageCount} onClick={() => setPage(Math.min(pageCount, page + 1))} className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
