import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({className, animated = false}: {className?: string, animated?: boolean}) {
  return (
    <div className={cn("flex justify-center relative overflow-hidden", className)}>
      <Image
        src="/images/logo.png"
        alt="AskPix AI Logo"
        className="object-contain"
        fill
        unoptimized
      />
      {animated && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />}
    </div>
  );
}
