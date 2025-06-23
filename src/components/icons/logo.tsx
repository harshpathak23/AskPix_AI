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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}>
        <circle cx="12" cy="12" r="2" />
        <path d="M21.17 8H12" />
        <path d="M3.62 7.78 12 12" />
        <path d="M12 21.17V12" />
        <path d="M20.38 16.22 12 12" />
        <path d="M3.83 16H12" />
        <path d="M11.62 3.62 12 12" />
    </svg>
  );
}
