import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({className, animated = false}: {className?: string, animated?: boolean}) {
  return (
    <div className={cn("flex justify-center relative overflow-hidden", className)}>
      <Image
        src="/logo.png"
        alt="ScanSolve AI Logo"
        width={320}
        height={320}
        priority
        className="object-contain w-full h-full"
      />
      {animated && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />}
    </div>
  );
}
