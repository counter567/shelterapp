import { useState } from "react";
import { SelectDownArrow } from "./icons/SelectDownArrow";

import "./CheckBox.css";

const labelClass = "sa-checkbox w-full whitespace-nowrap justify-start font-medium text-sm px-5 py-2.5 text-center inline-flex items-center";

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
      <div style={{minWidth: '20vw'}}>
        <label className={labelClass} htmlFor={`sa-checkbox-${id}`}><input id={`sa-checkbox-${id}`} type="checkbox" defaultChecked={defaultValue} checked={value} onChange={(ev) => {
          ev.target.checked ? callback(true) : callback(false);
        }}/><span className="sa-checkmark"></span>{label}</label>
      </div>
    </>
  );
};

export default CheckBox;
