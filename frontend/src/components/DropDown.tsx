import { useState } from "react";

interface DropDownProps {
  items: { name: string; id?: string | number }[];
  value?: string | number;
  defaultValue?: string | number;
  callback: (value: any) => void;
}

const DropDown = ({ items, value, defaultValue, callback }: DropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSelectItemName = (
    selectItems: { id?: string | number; name: string }[],
    defaultValue?: string | number,
    value?: string | number
  ) => {
    return (
      selectItems.find((option) => option.id === value || option.name === value)
        ?.name || defaultValue
    );
  };
  return (
    <>
      <div>
        <button
          data-dropdown-toggle="dropdown"
          className="text-white min-w-40 justify-between bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
        >
          {getSelectItemName(items, defaultValue, value)}
          <svg
            className="w-2.5 h-2.5 ms-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        <div
          id="dropdown"
          className={
            "z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 absolute" +
            (isOpen ? " block" : " hidden")
          }
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200 relative">
            {items.map(({ name, id }, index) => (
              <li
                key={index}
                onClick={() => {
                  setIsOpen(false);
                  callback(id);
                }}
              >
                <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="absolute top-0 left-0 w-screen h-screen"
          >
            <div className="backdrop-blur-xs relative w-screen h-screen"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default DropDown;
