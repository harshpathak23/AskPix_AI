import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({className}: {className?: string}) {
  return (
    <div className={cn("flex justify-center", className)}>
      <Image
        src="/logo-light.png" // This points to /public/logo-light.png
        alt="AI Question Solver Logo"
        width={128}
        height={128}
        priority
      />
    </div>
  );
}
