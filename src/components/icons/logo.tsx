import * as React from "react";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 10a3 3 0 1 0-5.12 2.12" />
      <path d="M10 10L14 14" />
      <path d="M4.22 4.22l1.42 1.42" />
      <path d="M1 11h4" />
      <path d="M4.22 17.78l1.42-1.42" />
      <path d="M7 21v-4" />
      <path d="M12.34 16.34c-1.25.9-2.73.57-3.68-.38" />
      <path d="m14 14 3-3" />
      <path d="M19.07 4.93A5.006 5.006 0 0 0 14 4a5 5 0 0 0-5 5c0 1.5.67 2.83 1.69 3.69" />
      <path d="M14 9h.01" />
    </svg>
  );
}
