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
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Detailed Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <MathRenderer text={displayedSolution} />
          {isTyping && <span className="animate-pulse">▋</span>}
        </CardContent>
      </Card>
    </div>
  );
}
