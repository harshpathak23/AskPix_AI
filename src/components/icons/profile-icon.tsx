import { cn } from "@/lib/utils"

export function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
    >
      <defs>
        <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#8e44ad' }} />
          <stop offset="50%" style={{ stopColor: '#d92c78' }} />
          <stop offset="100%" style={{ stopColor: '#3498db' }} />
        </linearGradient>
      </defs>
      <path
        fill="url(#profileGradient)"
        d="M399,384.2C376.9,345.8,335.4,320,288,320H224c-47.4,0-88.9,25.8-111,64.2c35.2,39.2,86.2,63.8,143,63.8s107.8-24.6,143-63.8z M256,288c-61.9,0-112-50.1-112-112S194.1,64,256,64s112,50.1,112,112S317.9,288,256,288z"
      />
    </svg>
  );
}
