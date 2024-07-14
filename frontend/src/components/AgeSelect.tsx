import { useState } from "react";
import { SelectDownArrow } from "./icons/SelectDownArrow";

interface AgeSelectProps {
  value: [number, number];
  defaultValue: [number, number];
  callback: (value: any) => void;
}

const defaultStyle =
  "text-white whitespace-nowrap justify-between bg-blue-700 font-medium text-sm py-2.5 text-center inline-flex items-center dark:bg-blue-600";
const buttonStyle = `${defaultStyle} w-full hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:hover:bg-blue-700 dark:focus:ring-blue-800`;
const minWidth = "10px";
const items_max = new Array(20).fill(0).map((_, i) => {
  return {
    name: i === 0 ? "Alle" : `${i}`,
    id: i,
  };
});
const items_min = new Array(20).fill(0).map((_, i) => {
  return {
    name: i === 0 ? "Alle" : `${i - 1}`,
    id: i,
  };
});

const AgeSelect = ({ value, defaultValue, callback }: AgeSelectProps) => {
  const [isOpenMax, setIsOpenMax] = useState(false);
  const [isOpenMin, setIsOpenMin] = useState(false);

  const getSelectItemName = (
    selectItems: { id?: number; name: string }[],
    defaultValue?: number,
    value?: number
  ) => {
    return (
      selectItems.find((option) => option.id === value)?.name || defaultValue
    );
  };
  return (
    <div className="flex text-right" style={{ minWidth: "20vw" }}>
      <div
        className={`rounded-l-lg grow-0 pl-5 pr-1 opacity-80  ${defaultStyle}`}
      >
        Alter:
      </div>

      <div className="grow" style={{ minWidth }}>
        <button
          data-dropdown-toggle="dropdown"
          className={`${buttonStyle} px-1`}
          type="button"
          onClick={() => setIsOpenMin((value) => !value)}
        >
          {getSelectItemName(items_min, defaultValue[1], value[1])}
          <SelectDownArrow className="w-2.5 h-2.5 ms-1" />
        </button>
        <div
          id="dropdown"
          className={
            "z-20 bg-white divide-y divide-gray-100 shadow w-44 dark:bg-gray-700 absolute" +
            (isOpenMin ? " block" : " hidden")
          }
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200 relative">
            {items_min.map(({ name, id }, index) => (
              <li
                key={index}
                onClick={() => {
                  setIsOpenMin(false);
                  callback([
                    id === 0 || value[0] === 0
                      ? value[0]
                      : Math.max(id, value[0]),
                    id,
                  ]);
                }}
              >
                <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {isOpenMin && (
          <div
            onClick={() => setIsOpenMin(false)}
            className="absolute top-0 left-0 w-screen h-screen"
          >
            <div className="z-1000 relative w-screen h-screen"></div>
          </div>
        )}
      </div>

      <div className={`px-1 opacity-80  ${defaultStyle}`}>-</div>

      <div className="grow" style={{ minWidth }}>
        <button
          data-dropdown-toggle="dropdown"
          className={`${buttonStyle} pl-1 pr-5 rounded-r-lg`}
          type="button"
          onClick={() => setIsOpenMax((value) => !value)}
        >
          {getSelectItemName(items_max, defaultValue[0], value[0])}
          <SelectDownArrow className="w-2.5 h-2.5 ms-1" />
        </button>
        <div
          id="dropdown"
          className={
            "z-20 bg-white divide-y divide-gray-100 shadow w-44 dark:bg-gray-700 absolute" +
            (isOpenMax ? " block" : " hidden")
          }
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200 relative">
            {items_max.map(({ name, id }, index) => (
              <li
                key={index}
                onClick={() => {
                  setIsOpenMax(false);
                  callback([
                    id,
                    id === 0 || value[1] === 0
                      ? value[1]
                      : Math.min(id, value[1]),
                  ]);
                }}
              >
                <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {isOpenMax && (
          <div
            onClick={() => setIsOpenMax(false)}
            className="absolute top-0 left-0 w-screen h-screen"
          >
            <div className="z-1000 relative w-screen h-screen"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgeSelect;
