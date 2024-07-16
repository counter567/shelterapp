import { useEffect, useState } from "react";
import { SelectDownArrow } from "./icons/SelectDownArrow";

interface TrippleValueDropdownProps {
  label: string;
  value?: boolean | string;
  callback: (value: any) => void;
}

const options = [
  { value: undefined, name: "Egal" },
  { value: true, name: "Ja" },
  { value: false, name: "Nein" },
];
const TrippleValueDropdown = ({
  value = undefined,
  label,
  callback,
}: TrippleValueDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<boolean | undefined>(
    undefined
  );
  useEffect(() => {
    console.log(label, value);
    if (typeof value === "string") {
      value = value === "true" ? true : false;
    }
    setCurrentValue(() => value as boolean | undefined);
  }, [value, setCurrentValue]);

  const getSelectItemName = () => {
    return options.find((option) => option.value === currentValue)?.name;
  };
  return (
    <>
      <div>
        <div
          className="flex items-center justify-between"
          style={{ minWidth: "20vw" }}
        >
          <label className="font-bold text-nowrap mr-4">{label}:</label>
          <div>
            <button
              data-dropdown-toggle="dropdown"
              className="text-white whitespace-nowrap justify-between bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 min-w-48"
              type="button"
              onClick={() => setIsOpen((value) => !value)}
            >
              {getSelectItemName()}
              <SelectDownArrow />
            </button>
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
            {isOpen && (
              <div
                onClick={() => setIsOpen(false)}
                className="absolute top-0 left-0 w-screen h-screen"
              >
                <div className="z-1000 relative w-screen h-screen"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TrippleValueDropdown;
