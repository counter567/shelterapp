import React from "react";
import ArrowLeft from "../icons/arrowLeft";
import ArrowRight from "../icons/arrowRight";


const baseClasses = 'flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 select-none';
const activeClasses = 'cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white';
const disabledClasses = 'cursor-not-allowed';
const disabledClassesArrows = 'cursor-not-allowed opacity-50';


const Pagination = ({
  currentPage = 1,
  maxPages = 1,
  onPageChange = (page: number) => {},
  padding = 2
}) => {
  if(maxPages < 2) {
    return <></>
  }
  const pages: number[] = [1];

  if(currentPage - padding > 1) {
    pages.push(-1);
  }

  for (let i = -padding; i <= padding; i++) {
    if(i+currentPage > 1 && i+currentPage < maxPages) {
      pages.push(i+currentPage);
    }
  }
  
  if(currentPage + padding < maxPages) {
    pages.push(-1);
  }
  pages.push(maxPages);


  return (
    <nav className="flex justify-center m-4">
      <ul className="flex items-center -space-x-px h-10 text-base w-full">
        <li
          onClick={() => onPageChange(currentPage - 1)}
          className={`${
            currentPage === 1
              ? disabledClassesArrows
              : activeClasses
          } ${baseClasses}`}
        >
          <ArrowLeft />
        </li>
        <li className="grow"></li>
        {pages.map((index) => (
          <li
            onClick={() => {
              if (currentPage !== index && index !== -1) onPageChange(index);
            }}
            key={index}
            className={`${
              currentPage === index || index === -1
                ? disabledClasses
                : activeClasses
            } ${baseClasses}`}
          >
            {index === currentPage ? (<strong>{index}</strong> ) :
            index === -1 ? (<span>…</span>) :
            (<span>{index}</span>)}
          </li>
        ))}
        
        <li className="grow"></li>
        <li
          onClick={() => onPageChange(currentPage + 1)}
          className={`${
            currentPage === maxPages
              ? disabledClassesArrows
              : activeClasses
          } ${baseClasses}`}
        >
          <ArrowRight />
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
