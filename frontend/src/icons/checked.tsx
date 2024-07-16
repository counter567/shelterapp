import React from 'react';

const Checked = () => (
  <div>
    <span className="sr-only">Checked</span>
    <svg
      className="w-6 h-6"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      />
    </svg>
  </div>
);

export default Checked;
