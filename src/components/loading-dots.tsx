import { cn } from "@/lib/utils";

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <span className="sr-only">Loading...</span>
      <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
    </div>
  );
}
