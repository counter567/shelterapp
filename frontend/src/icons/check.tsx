import { IconProps } from "./icon.interface";

const CheckIcon = ({ size = 18, className, stroke }: IconProps) => (
  <svg
    style={{
      width: `${size}px`,
      height: `${size}px`,
      display: "inline",
    }}
    className={className ?? ""}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 12.6111L8.92308 17.5L20 6.5"
      stroke={stroke ?? "#000000"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CheckIcon;
