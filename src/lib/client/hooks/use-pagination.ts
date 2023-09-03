import * as React from "react";
import { range } from "~/lib/shared/utils.shared";

export const PAGINATION_DOTS = "...";

/**
 * usePagination, used for the Pagination component
 *
 * Copied from here : https://github.com/mayankshubham/react-pagination/blob/master/src/usePagination.js
 * @param param0
 * @returns
 */
export function usePagination({
  totalCount,
  perPage,
  siblingCount = 1,
  currentPage,
}: {
  totalCount: number;
  perPage: number;
  siblingCount: number;
  currentPage: number;
}) {
  const paginationRange = React.useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / perPage);

    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    /*
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    );

    /*
      We do not want to show dots if there is only one position left 
      after/before the left/right page count as that would lead to a change if our Pagination
      component size which we do not want
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);

      return [...leftRange, PAGINATION_DOTS, totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount
      );
      return [firstPageIndex, PAGINATION_DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [
        firstPageIndex,
        PAGINATION_DOTS,
        ...middleRange,
        PAGINATION_DOTS,
        lastPageIndex,
      ];
    }

    return [];
  }, [totalCount, perPage, siblingCount, currentPage]);

  return paginationRange;
}
