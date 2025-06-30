
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export const SplashScreen = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-700 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="animate-pulse-and-fade">
        <div className="relative h-64 w-64 overflow-hidden">
          <Image
            src="/icon.png"
            alt="AskPix AI App Icon"
            fill
            priority
            className="object-contain"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
        </div>
      </div>
    </div>
  );
};
