'use client';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import React from 'react';

// This component is necessary to avoid SSR hydration mismatches with KaTeX.
// It splits the text into parts and renders math expressions with react-katex.
export function MathRenderer({ text }: { text: string }) {
  // First, split the entire text by block-level math expressions.
  // This gives us an array of alternating text chunks and block math chunks.
  const blockRegex = /(\$\$[\s\S]*?\$\$)/g;
  const chunks = text.split(blockRegex).filter(Boolean);

  return (
    <div className="text-base leading-relaxed space-y-4">
      {chunks.map((chunk, chunkIndex) => {
        // Check if the chunk is a block math expression
        if (chunk.startsWith('$$') && chunk.endsWith('$$')) {
          return (
            <div key={chunkIndex} className="my-2 overflow-x-auto">
              <BlockMath math={chunk.slice(2, -2)} />
            </div>
          );
        } else {
          // This chunk is regular text, which may contain paragraphs and inline math.
          const paragraphs = chunk.split(/\n+/).filter(Boolean);
          const inlineRegex = /(\$[\s\S]*?\$)/g;

          return paragraphs.map((paragraph, pIndex) => {
            // Split the paragraph by inline math
            const parts = paragraph.split(inlineRegex).filter(Boolean);
            return (
              <p key={`${chunkIndex}-${pIndex}`}>
                {parts.map((part, partIndex) => {
                  if (part.startsWith('$') && part.endsWith('$')) {
                    // Render inline math
                    return <InlineMath key={partIndex} math={part.slice(1, -1)} />;
                  }
                  // Render regular text
                  return <span key={partIndex}>{part}</span>;
                })}
              </p>
            );
          });
        }
      })}
    </div>
  );
}
