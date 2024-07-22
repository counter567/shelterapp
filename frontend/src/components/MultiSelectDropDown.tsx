import { useState } from "react";
import Checked from "../icons/checked";
import { SelectDownArrow } from "./icons/SelectDownArrow";
import { AnimalStatus } from "../models/animalStatus";

interface MultiSelectDropDownProps {
  items: { name: string; id?: string | number }[];
  value?: Array<string | number>;
  defaultValue?: Array<string | number>;
  callback: (value: Array<string | number> | undefined) => void;
}

const MultiSelectDropDown = ({
  items,
  value,
  defaultValue,
  callback,
}: MultiSelectDropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSelectItemCount = (
    selectItems: { id?: string | number; name: string }[],
    defaultValue?: Array<string | number>,
    value?: Array<string | number>
  ) => {
    let count = value?.length || Object.keys(AnimalStatus).length;
    if (count < Object.keys(AnimalStatus).length) {
      return `Ausgewählt: ${count}`;
    } else {
      return "Alle";
    }
  };
  return (
    <>
      <div>
        <button
          data-dropdown-toggle="dropdown"
          className="button flex justify-between items-center w-full"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          style={{ overflow: "hidden" }}
        >
          {getSelectItemCount(items, defaultValue, value)}
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
                  if (value?.find((it: string | number) => it === id)) {
                    callback(value?.filter((element) => element !== id));
                  } else {
                    callback(value?.concat([id!]) || []);
                  }
                }}
              >
                <div className="hover:bg-gray-100   cursor-pointer flex items-center justify-between">
                  <span className="block px-4 py-2">{name}</span>
                  {value?.find((it: string | number) => it === id) !==
                    undefined && (
                    <div className="pr-2">
                      <Checked />
                    </div>
                  )}
                </div>
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

export default MultiSelectDropDown;
