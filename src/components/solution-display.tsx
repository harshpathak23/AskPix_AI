import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface SolutionDisplayProps {
  question: string;
  solution: string;
}

export function SolutionDisplay({ question, solution }: SolutionDisplayProps) {
  return (
    <div className="space-y-6 mt-8 w-full animate-in fade-in-50 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Your Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap font-sans text-base">
            {question}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap font-sans text-base leading-relaxed">
            {solution}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
