import * as React from "react";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 125 40"
      {...props}
    >
      <g transform="translate(20 20)">
        <ellipse cx="0" cy="0" rx="6" ry="15" fill="#5E7354" transform="rotate(-35)" />
        <ellipse cx="0" cy="0" rx="6" ry="15" fill="#6A7F5D" transform="rotate(-15)" />
        <ellipse cx="0" cy="0" rx="6" ry="15" fill="#758A67" transform="rotate(15)" />
        <ellipse cx="0" cy="0" rx="6" ry="15" fill="#809978" transform="rotate(35)" />
      </g>
      <text
        x="45"
        y="27"
        fontFamily="serif"
        fontSize="22"
        fontWeight="500"
        fill="#4a5c43"
      >
        AskPix AI
      </text>
    </svg>
  );
}
