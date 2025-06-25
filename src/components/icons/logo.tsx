import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <div className={cn("flex justify-center", className)}>
      <Image
        className="animate-subtle-float"
        src="/logo.png"
        alt="ScanSolve Logo"
        width={320}
        height={320}
        priority
      />
    </div>
  );
}
