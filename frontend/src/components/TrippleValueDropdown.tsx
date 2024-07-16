import { useEffect, useState } from "react";
import { SelectDownArrow } from "./icons/SelectDownArrow";

interface TrippleValueDropdownProps {
  label: string;
  value?: boolean;
  callback: (value: any) => void;
}

const options = [
  { value: undefined, name: "Egal" },
  { value: true, name: "Ja" },
  { value: false, name: "Nein" },
];
const TrippleValueDropdown = ({
  value,
  label,
  callback,
}: TrippleValueDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<boolean | undefined>(
    undefined
  );
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const getSelectItemName = () => {
    if (currentValue === true) return "Ja";
    if (currentValue === false) return "Nein";
    else return "Egal";
  };
  return (
    <>
      <div className="flex items-center" style={{ minWidth: "20vw" }}>
        <label className="font-bold text-nowrap mr-4 flex-1">{label}:</label>
        <button
          data-dropdown-toggle="dropdown"
          className="text-white whitespace-nowrap justify-between bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-1/2"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
        >
          {getSelectItemName()}
          <SelectDownArrow />
        </button>
        <div className="relative">
          <div
            id="dropdown"
            className={
              "z-20 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 absolute" +
              (isOpen ? " block" : " hidden")
            }
          >
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200 relative">
              {options.map(({ name, value }, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setCurrentValue(value);
                    callback(value);
                    setIsOpen(false);
                  }}
                >
                  <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
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

export default TrippleValueDropdown;
