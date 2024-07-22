import { useState } from "react";

import "./CheckBox.css";

let checkbox = 0;

interface CheckBoxProps {
  value?: boolean;
  label?: string | JSX.Element;
  callback: (value: boolean) => void;
}

const CheckBox = ({ value = false, label, callback }: CheckBoxProps) => {
  const [id] = useState(checkbox++);
  return (
    <>
      <div>
        <div className="flex items-center">
          <input
            id={`sa-checkbox-${id}`}
            checked={value}
            type="checkbox"
            onChange={(ev) => {
              ev.target.checked ? callback(true) : callback(false);
            }}
            className="w-5 h-5 cursor-pointer text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500   focus:ring-2  "
          />
          <label
            htmlFor={`sa-checkbox-${id}`}
            className="ms-2 cursor-pointer text-sm font-medium text-gray-900 "
          >
            {label}
          </label>
        </div>
      </div>
    </>
  );
};

export default CheckBox;
