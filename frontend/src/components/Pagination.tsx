import React from "react";
import ArrowLeft from "../icons/arrowLeft";
import ArrowRight from "../icons/arrowRight";

const Pagination = ({
  currentPage = 1,
  maxPages = 1,
  onPageChange = (page: number) => {},
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= maxPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center">
      <ul className="flex items-center -space-x-px h-10 text-base">
        <li
          onClick={() => onPageChange(currentPage - 1)}
          className={`${
            currentPage === 1
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
          } flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
        >
          <ArrowLeft />
        </li>
        {[...Array(maxPages)].map((_, index) => (
          <li
            onClick={() => {
              if (currentPage !== index + 1) onPageChange(index + 1);
            }}
            key={index}
            className={`${
              currentPage === 1 + index
                ? "cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
            } flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
          >
            {1 + index === currentPage ? (
              <strong>{1 + index}</strong>
            ) : (
              <span>{1 + index}</span>
            )}
          </li>
        ))}
        <li
          onClick={() => onPageChange(currentPage + 1)}
          className={`${
            currentPage === maxPages
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
          } flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
        >
          <ArrowRight />
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
