import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative h-16 w-16">
        <Image
          src="/logo.png"
          alt="App Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
