'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MathRenderer } from "./math-renderer";

interface SolutionDisplayProps {
  solution: string;
}

export function SolutionDisplay({ solution }: SolutionDisplayProps) {
  const [displayedSolution, setDisplayedSolution] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedSolution(''); // Reset on new solution
    setIsTyping(true);

    // No typing effect for very short solutions, show immediately
    if (solution.length < 100) {
        setDisplayedSolution(solution);
        setIsTyping(false);
        return;
    }

    const words = solution.split(/(\s+)/); // Split by spaces, keeping them
    let currentIndex = 0;
    
    const intervalId = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedSolution((prev) => prev + words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 20); // Adjust speed of typing here

    return () => clearInterval(intervalId);
  }, [solution]);

  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <Card className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 border-purple-900/50">
        <CardHeader>
          <CardTitle className="text-slate-100">Detailed Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <MathRenderer text={displayedSolution} />
          {isTyping && (
            <div className="pt-4 text-muted-foreground animate-pulse">
              Typing.....
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
