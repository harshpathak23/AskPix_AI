import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative h-80 w-80">
        <Image
          src="/logo.png"
          alt="App Logo"
          fill
          className="object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
          priority
        />
      </div>
    </div>
  );
}
