'use client';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import React from 'react';

// This component is necessary to avoid SSR hydration mismatches with KaTeX.
// It splits the text into parts and renders math expressions with react-katex.
export function MathRenderer({ text }: { text: string }) {
  // Regex to find math expressions wrapped in $...$ or $$...$$
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  const parts = text.split(regex).filter(Boolean); // filter Boolean removes empty strings

  return (
    <div className="text-base leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Display math
          return (
            <div key={index} className="my-2 overflow-x-auto">
              <BlockMath math={part.slice(2, -2)} />
            </div>
          );
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          // Inline math
          return <InlineMath key={index} math={part.slice(1, -1)} />;
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
