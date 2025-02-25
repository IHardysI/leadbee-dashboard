import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPaginationItems = (): (number | string)[] => {
    if (totalPages <= 10) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 6) {
      // Show first 8 pages, then dots, then last page
      return [...Array.from({ length: 8 }, (_, i) => i + 1), '...', totalPages];
    } else if (currentPage >= totalPages - 5) {
      // Show first page, then dots, then last 8 pages
      return [1, '...', ...Array.from({ length: 8 }, (_, i) => totalPages - 7 + i)];
    } else {
      // Show first page, dots, currentPage-2, -1, current, +1, +2, dots, last page
      return [1, '...', currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, '...', totalPages];
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Предыдущая
      </Button>
      {getPaginationItems().map((item, idx) =>
        typeof item === 'number' ? (
          <Button
            key={idx}
            variant={currentPage === item ? 'default' : 'outline'}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ) : (
          <span key={idx} className="px-2">
            {item}
          </span>
        )
      )}
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Следующая
      </Button>
    </div>
  );
}

export default Pagination; 