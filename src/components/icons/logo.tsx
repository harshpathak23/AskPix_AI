import * as React from "react";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g transform="translate(12 12)">
        <path
          d="M0-8 a8 4 0 0 1 0 16 a8 4 0 0 1 0-16"
          fill="#A9B8A4"
          transform="rotate(135)"
        />
        <path
          d="M0-8 a8 4 0 0 1 0 16 a8 4 0 0 1 0-16"
          fill="#BAC5B6"
          transform="rotate(45)"
        />
        <path
          d="M0-8 a8 4 0 0 1 0 16 a8 4 0 0 1 0-16"
          fill="#8E9E89"
          transform="rotate(-135)"
        />
        <path
          d="M0-8 a8 4 0 0 1 0 16 a8 4 0 0 1 0-16"
          fill="#C3D1BE"
          transform="rotate(-45)"
        />
      </g>
    </svg>
  );
}
