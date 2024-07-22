import { useState } from "react";
import { SelectDownArrow } from "./icons/SelectDownArrow";

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
    const val =
      selectItems.find((option) => option.id === value)?.name || defaultValue;
    return val;
  };
  return (
    <>
      <div>
        <button
          data-dropdown-toggle="dropdown"
          className="button flex justify-between items-center w-full"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
        >
          {getSelectItemName(items, defaultValue, value)}
          <SelectDownArrow />
        </button>
        <div
          id="dropdown"
          className={
            "z-20 bg-white divide-y divide-gray-100 rounded-lg shadow w-44  absolute" +
            (isOpen ? " block" : " hidden")
          }
        >
          <ul className="py-2 text-sm text-gray-700  relative">
            {items.map(({ name, id }, index) => (
              <li
                key={index}
                onClick={() => {
                  setIsOpen(false);
                  callback(id);
                }}
              >
                <span className="block px-4 py-2 hover:bg-gray-100   cursor-pointer">
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
            <div className="z-1000 relative w-screen h-screen"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default DropDown;
