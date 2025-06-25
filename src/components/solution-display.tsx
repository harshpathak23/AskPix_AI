import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MathRenderer } from "./math-renderer";

interface SolutionDisplayProps {
  solution: string;
}

export function SolutionDisplay({ solution }: SolutionDisplayProps) {

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
    </div>
  );
}
