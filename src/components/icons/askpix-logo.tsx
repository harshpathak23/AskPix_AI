import { cn } from "@/lib/utils"

export function AskPixLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 256 256"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
      >
        <path d="M216.66,104.57a8,8,0,0,1-8.54,6.86,72.1,72.1,0,0,0-56.24,56.24,8,8,0,0,1-15.78,1.46,88.11,88.11,0,0,1,69.1-69.1A8,8,0,0,1,216.66,104.57ZM111.43,39.34a8,8,0,0,0-15.78,1.46,72.1,72.1,0,0,0-56.24,56.24,8,8,0,0,0,6.86,8.54,8.12,8.12,0,0,0,1.68,0,8,8,0,0,0,7.1-8.62,56.09,56.09,0,0,1,43.52-43.52A8,8,0,0,0,111.43,39.34ZM224,128a95.83,95.83,0,0,1-23.34,64.66,8,8,0,0,1-11.32-11.32A80,80,0,1,1,181.33,72,8,8,0,0,1,192,64,96.11,96.11,0,0,1,224,128Z" />
      </svg>
      <span className="font-semibold tracking-wider">AskPix AI</span>
    </div>
  );
}
