'use client';

import { cn } from '@/lib/utils';

export const SplashScreen = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 transition-opacity duration-700 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="relative h-64 w-64">
        <img
          src="/images/icon.png"
          alt="AskPix AI App Icon"
          className={cn(
            'object-contain w-full h-full',
            // Add pop-in animation when the splash screen is visible
            isVisible && 'animate-pop-in'
          )}
        />
      </div>
    </div>
  );
};
