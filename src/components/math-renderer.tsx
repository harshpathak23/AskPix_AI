'use client';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import React from 'react';

// This component is necessary to avoid SSR hydration mismatches with KaTeX.
// It splits the text into parts and renders math expressions with react-katex.
export function MathRenderer({ text }: { text: string }) {
  // Split the whole text into paragraphs based on one or more newlines
  const paragraphs = text.split(/\n+/).filter(Boolean);

  return (
    <div className="text-base leading-relaxed space-y-4">
      {paragraphs.map((paragraph, pIndex) => {
        // For each paragraph, split by math expressions
        const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
        const parts = paragraph.split(regex).filter(Boolean);

        return (
          <p key={pIndex}>
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
          </p>
        );
      })}
    </div>
  );
}
