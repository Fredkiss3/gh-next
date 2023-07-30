import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@primer/octicons-react";
import { clsx } from "~/lib/functions";
import { PAGINATION_DOTS, usePagination } from "~/lib/hooks/use-pagination";
import { Button } from "./button";

export type PaginationProps = {
  totalCount: number;
  currentPage: number;
  perPage: number;
  className?: string;
  baseURL: string;
};

export function Pagination({
  totalCount,
  currentPage,
  className,
  perPage,
  baseURL,
}: PaginationProps) {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount: 1,
    perPage,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const lastPage = paginationRange[paginationRange.length - 1];
  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className="mx-auto"
    >
      <ul className={clsx(className, "flex items-center gap-2")}>
        <li>
          <Button
            // @ts-expect-error
            href={currentPage === 1 ? "#" : baseURL + (currentPage - 1)}
            variant="accent-ghost"
            aria-disabled={currentPage === 1 ? true : undefined}
            className={clsx({
              "pointer-events-none": currentPage === 1,
            })}
            renderLeadingIcon={(cls) => <ChevronLeftIcon className={cls} />}
          >
            Previous <span className="sr-only">page</span>
          </Button>
        </li>

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === PAGINATION_DOTS) {
            return (
              <li key={`DOTS-${index}`} className="text-grey">
                &#8230;
              </li>
            );
          }

          let pageLabel = `Page ${pageNumber}`;
          if (pageNumber === currentPage) {
            pageLabel = "Current Page, " + pageLabel;
          }
          return (
            <li key={pageNumber}>
              <Button
                // @ts-expect-error
                href={baseURL + pageNumber}
                variant="ghost"
                aria-label={pageLabel}
                aria-current={pageNumber === currentPage ? "page" : undefined}
              >
                {pageNumber}
                {pageNumber === 1 && (
                  <span className="sr-only">&nbsp;(first page)</span>
                )}
                {pageNumber === lastPage && (
                  <span className="sr-only">&nbsp;(last page)</span>
                )}
              </Button>
            </li>
          );
        })}

        <li>
          <Button
            // @ts-expect-error
            href={currentPage === lastPage ? "#" : baseURL + (currentPage + 1)}
            variant="accent-ghost"
            aria-disabled={currentPage === lastPage ? true : undefined}
            renderTrailingIcon={(cls) => <ChevronRightIcon className={cls} />}
            className={clsx({
              "pointer-events-none": currentPage === lastPage,
            })}
          >
            Next <span className="sr-only">page</span>
          </Button>
        </li>
      </ul>
    </nav>
  );
}
