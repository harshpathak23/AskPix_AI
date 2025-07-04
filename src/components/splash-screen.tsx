'use client';

import { cn } from '@/lib/utils';

export const SplashScreen = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-cyan-500 transition-opacity duration-200 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      style={{
        transitionDuration: isVisible ? '0ms' : '0.2s',
      }}
    >
      <div className="relative h-64 w-64">
        <img
          src="/logo.png"
          alt="AskPix AI App Icon"
          className={cn(
            'object-contain w-full h-full',
            // Add pop-in animation when the splash screen is visible
            isVisible && 'animate-pop-in'
          )}
        />
      </div>
      <p
        className={cn(
          'text-white/80 text-sm tracking-wider mt-4 opacity-0', // Start with opacity-0 to prevent FOUC
          isVisible && 'animate-pop-in'
        )}
      >
        Build By Harsh Pathak
      </p>
    </div>
  );
};
