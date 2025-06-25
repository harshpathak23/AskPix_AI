import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative h-80 w-80 rounded-full bg-slate-100/10 backdrop-blur-sm p-8 ring-1 ring-white/20 shadow-lg">
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
