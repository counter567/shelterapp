import { useState } from "react";

import "./CheckBox.css";

let checkbox = 0;

interface DropDownProps {
  value?: boolean;
  defaultValue?: boolean;
  label?: string | JSX.Element;
  callback: (value: boolean) => void;
}

const CheckBox = ({ value, defaultValue, label, callback }: DropDownProps) => {
  const [id] = useState(checkbox++);
  return (
    <>
      <div style={{ minWidth: "20vw" }}>
        <div className="flex items-center">
          <input
            id={`sa-checkbox-${id}`}
            checked={value ?? defaultValue}
            type="checkbox"
            onChange={(ev) => {
              ev.target.checked ? callback(true) : callback(false);
            }}
            className="w-5 h-5 cursor-pointer text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor={`sa-checkbox-${id}`}
            className="ms-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            {label}
          </label>
        </div>
      </div>
    </>
  );
};

export default CheckBox;