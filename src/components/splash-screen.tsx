'use client';

import { cn } from '@/lib/utils';

export const SplashScreen = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-700 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="relative h-64 w-64">
        <img
          src="/images/icon.png"
          alt="AskPix AI App Icon"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
};
