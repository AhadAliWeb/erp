import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, dataLength, limit, onPageChange }) {
  const isFirst = currentPage <= 1;
  // const isLast  = currentPage >= totalPages;

  const hasNextPage = dataLength === limit;

  const btnBase = 'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors';
  const btnActive = 'border-gray-300 text-gray-700 hover:bg-gray-50';
  const btnDisabled = 'border-gray-100 text-gray-300 cursor-not-allowed';

  return (
    <div className="flex items-center gap-3 mt-4 justify-end">
      <button
        onClick={() => !isFirst && onPageChange(currentPage - 1)}
        disabled={isFirst}
        className={`${btnBase} ${isFirst ? btnDisabled : btnActive}`}
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
        <span>Prev</span>
      </button>

      <span className="text-sm text-gray-600">
        Page <span className="font-semibold text-gray-800">{currentPage}</span>
      </span>

      <button
        onClick={() => hasNextPage && onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`${btnBase} ${!hasNextPage ? btnDisabled : btnActive}`}
        aria-label="Next page"
      >
        <span>Next</span>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
