
'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export const SplashScreen = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 transition-opacity duration-200 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      style={{
        transitionDuration: isVisible ? '0ms' : '0.2s',
      }}
    >
      <div
        className={cn(
          'relative h-64 w-64',
          isVisible && 'animate-pop-in'
        )}
      >
        <Image
          src="/images/icon.png"
          alt="AskPix App Icon"
          className="object-contain"
          fill
          unoptimized
        />
      </div>
      <p
        className={cn(
          'text-white/80 text-sm tracking-wider mt-4 opacity-0',
          isVisible && 'animate-pop-in'
        )}
        style={{ animationDelay: '150ms' }}
      >
        Build By Harsh Pathak
      </p>
    </div>
  );
};

    