import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { MathRenderer } from "./math-renderer";


interface SolutionDisplayProps {
  solutionSteps: string[];
}

export function SolutionDisplay({ solutionSteps }: SolutionDisplayProps) {

  return (
    <div className="space-y-6 mt-8 w-full animate-in fade-in-50 duration-500">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Step-by-Step Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {solutionSteps.map((step, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>Step {index + 1}</AccordionTrigger>
                <AccordionContent>
                  <MathRenderer text={step} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
