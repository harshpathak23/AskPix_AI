'use client';

import Link from 'next/link';
import { Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.92C34.553 6.182 29.632 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691c-1.339 2.583-2.131 5.43-2.131 8.309s.792 5.726 2.131 8.309l7.707-6.012C13.505 24.811 13 24.414 13 24s.505-.811 1.013-1.986l-7.707-6.323z" />
    <path fill="#4CAF50" d="M24 48c5.632 0 10.553-1.815 14.075-4.816l-7.707-6.012C28.39 39.186 26.34 40 24 40c-4.43 0-8.204-2.678-9.97-6.31l-7.707 6.012C9.449 44.404 16.21 48 24 48z" />
    <path fill="#1976D2" d="M43.611 20.083L43.59 20l-.007-.003c-2.025-4.49-5.92-7.925-10.42-9.764l-7.213 5.65C28.259 17.65 30.73 20 34.34 20h9.271z" />
  </svg>
);


export default function SignupClientPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Firebase is not configured. Please check your environment variables.");
      return;
    }
    setError(null);
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      // Successful sign in, redirect
      const pendingSolution = localStorage.getItem('pendingSolution');
      if (pendingSolution) {
        router.push('/');
      } else {
        router.push('/profile');
      }
    } catch (e) {
      const authError = e as AuthError;
      console.error("Google Sign-In Error: ", authError);
      let errorMessage = 'An unexpected error occurred during sign-up.';
      if (authError.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up cancelled. Please try again.';
      } else if (authError.code === 'auth/cancelled-popup-request' || authError.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-up popup was blocked. Please enable popups for this site and try again.';
      }
      setError(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <Card className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-purple-900/50 text-slate-200">
        <CardHeader className="text-center">
           <div className="flex flex-col items-center mb-6">
            <Logo className="h-[220px] w-[220px] mb-2" animated />
            <p className="text-xs text-slate-400 tracking-wider">Build By Harsh Pathak</p>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-100">Create an Account</CardTitle>
          <CardDescription className="text-slate-400 pt-1">
            Join now to unlock all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isSigningIn ? (
              <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">Redirecting to Google</h2>
                  <p className="text-slate-400 mb-6">Please complete the sign-up in the popup window.</p>
              </div>
            ) : (
                <>
                {error && (
                    <Alert variant="destructive" className="mb-4 bg-gradient-to-br from-rose-500 to-red-900 border-rose-400 text-white">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Signup Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-4">
                    <Button 
                      onClick={handleGoogleSignIn} 
                      className="w-full text-base py-6 bg-white text-black hover:bg-slate-200" 
                      disabled={isSigningIn}
                      variant="secondary"
                    >
                      <GoogleIcon />
                      Sign Up with Google
                    </Button>
                </div>
                <div className="mt-4 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="underline text-primary font-semibold">
                    Login
                    </Link>
                </div>
                <div className="mt-2 text-center text-sm">
                    <Link href="/" className="underline text-slate-500 hover:text-primary transition-colors">
                    Back to Home
                    </Link>
                </div>
                </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
