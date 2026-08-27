import { Skeleton } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';

interface CommonPaginationProps {
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PAGE_BUTTON_STYLE =
  'flex size-6 cursor-pointer items-center justify-center border border-foreground bg-background font-mono text-xs tracking-[0.1em] transition-colors hover:bg-foreground hover:text-background';

const VISIBLE_PAGE_COUNT = 3;

const PaginationEllipsis = () => (
  <span aria-hidden className={cn('flex items-center gap-[2px]')}>
    <span className={cn('bg-foreground size-[2px]')} />
    <span className={cn('bg-foreground size-[2px]')} />
    <span className={cn('bg-foreground size-[2px]')} />
  </span>
);

const CommonPagination = ({
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: CommonPaginationProps) => {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center gap-[10px]')}>
        <Skeleton className={cn('size-6')} />
        <Skeleton className={cn('size-6')} />
        <Skeleton className={cn('size-6')} />
        <Skeleton className={cn('size-6')} />
        <Skeleton className={cn('size-6')} />
      </div>
    );
  }

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: number[] = [];

    let startPage = Math.max(0, currentPage - Math.floor(VISIBLE_PAGE_COUNT / 2));
    const endPage = Math.min(totalPages - 1, startPage + VISIBLE_PAGE_COUNT - 1);

    if (endPage - startPage + 1 < VISIBLE_PAGE_COUNT) {
      startPage = Math.max(0, endPage - VISIBLE_PAGE_COUNT + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const firstVisiblePage = pageNumbers[0] ?? 0;
  const lastVisiblePage = pageNumbers[pageNumbers.length - 1] ?? 0;

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('flex items-center justify-center gap-[10px]')}
    >
      {firstVisiblePage > 0 && (
        <button type="button" className={cn(PAGE_BUTTON_STYLE)} onClick={() => onPageChange(0)}>
          1
        </button>
      )}
      {firstVisiblePage > 1 && <PaginationEllipsis />}

      <div className={cn('flex items-center')}>
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            aria-current={pageNum === currentPage ? 'page' : undefined}
            className={cn(
              PAGE_BUTTON_STYLE,
              '-ml-px first:ml-0',
              pageNum === currentPage && 'bg-foreground text-background',
            )}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum + 1}
          </button>
        ))}
      </div>

      {lastVisiblePage < totalPages - 2 && <PaginationEllipsis />}
      {lastVisiblePage < totalPages - 1 && (
        <button
          type="button"
          className={cn(PAGE_BUTTON_STYLE)}
          onClick={() => onPageChange(totalPages - 1)}
        >
          {totalPages}
        </button>
      )}
    </nav>
  );
};

export default CommonPagination;
