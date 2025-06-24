import * as React from "react";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 44 44"
      {...props}
    >
        {/* Icon: Magnifying glass with a leaf/plant inside */}
        <g transform="translate(2 2)">
            {/* Magnifying glass circle */}
            <circle cx="18" cy="18" r="16" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="3" />
            
            {/* Magnifying glass handle */}
            <line x1="30" y1="30" x2="40" y2="40" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            
            {/* Leaf/plant inside */}
            <path 
              d="M 18, 28 Q 18, 18 10, 14"
              stroke="hsl(var(--accent))"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path 
              d="M 18, 28 Q 18, 18 26, 14"
              stroke="hsl(var(--accent))"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
             <path 
              d="M 18, 28 L 18, 20"
              stroke="hsl(var(--accent))"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
        </g>
    </svg>
  );
}
