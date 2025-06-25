import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export function SolutionSkeleton() {
  return (
    <div className="space-y-6 mt-8 w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-1/3" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
        </CardContent>
      </Card>
    </div>
  );
}
