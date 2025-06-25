import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="relative h-80 w-80">
        <Image
          src="/logo.png"
          alt="AI Question Solver Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
