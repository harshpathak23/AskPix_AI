import { cn } from '@/lib/utils';
import Image from 'next/image';

// This component is now an alias for the main Logo component to ensure consistency.
export function AskPixLogo({className, animated = false}: {className?: string, animated?: boolean}) {
  return (
    <div className={cn("flex justify-center relative overflow-hidden", className)}>
      <Image
        src="/logo.png"
        alt="AskPix AI Logo"
        className="object-contain"
        fill
        unoptimized
      />
      {animated && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />}
    </div>
  );
}
