import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MathRenderer } from "./math-renderer";
import type { GraphData } from "@/ai/schemas";
import { SolutionChart } from "./solution-chart";

interface SolutionDisplayProps {
  solution: string;
  graphData?: GraphData | null;
}

export function SolutionDisplay({ solution, graphData }: SolutionDisplayProps) {

  return (
    <div className="space-y-6 mt-8 w-full animate-in fade-in-50 duration-500">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Detailed Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <MathRenderer text={solution} />
        </CardContent>
      </Card>
      
      {graphData && (
        <div className="animate-in fade-in-50 duration-500">
           <SolutionChart chartData={graphData} />
        </div>
      )}
    </div>
  );
}
