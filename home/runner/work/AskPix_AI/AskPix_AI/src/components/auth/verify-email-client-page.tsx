
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { sendEmailVerification, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck, Send, Loader2, LogOut, XCircle } from 'lucide-react';

export default function VerifyEmailClientPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for a specific error passed from the signup page.
    const verificationError = localStorage.getItem('verificationError');
    if (verificationError) {
      setError(verificationError);
      localStorage.removeItem('verificationError'); // Clear after displaying
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        currentUser.reload().then(() => {
          if (auth.currentUser?.emailVerified) {
            router.push('/profile');
          }
        });
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleResendVerification = async () => {
    if (!user) {
      setError("No user is signed in.");
      return;
    }
    setIsSending(true);
    setError(null);
    setMessage(null);
    try {
      await sendEmailVerification(user);
      setMessage("A new verification email has been sent to your address.");
    } catch (e) {
      console.error(e);
      setError("Failed to send verification email. Please try again in a few moments.");
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const checkVerificationStatus = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    await auth.currentUser.reload();
    if(auth.currentUser.emailVerified) {
        const pendingSolution = localStorage.getItem('pendingSolution');
        if (pendingSolution) {
            router.push('/');
        } else {
            router.push('/profile');
        }
    } else {
        setError("Your email is still not verified. Please check your inbox (and spam folder).");
        setLoading(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <Card className="w-full max-w-lg bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-purple-900/50 text-slate-200">
        <CardHeader className="text-center">
           <div className="flex flex-col items-center mb-6">
            <Logo className="h-20 w-20 mb-4" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-2">
            <MailCheck /> Verify Your Email
          </CardTitle>
          <CardDescription className="text-slate-400 pt-2 text-base">
            We've sent a verification link to <br/> <span className="font-bold text-slate-100">{user.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className="bg-green-900/50 border-green-500/50 text-white">
              <Send className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="bg-gradient-to-br from-rose-500 to-red-900 border-rose-400 text-white">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-center text-slate-300">
            Please click the link in the email to activate your account. If you don&apos;t see it, be sure to check your spam folder.
          </p>
          <Button onClick={checkVerificationStatus} className="w-full text-base py-6" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MailCheck className="mr-2 h-5 w-5" />}
            I&apos;ve Verified My Email
          </Button>
          <div className="flex items-center gap-4">
            <Button onClick={handleResendVerification} variant="secondary" className="w-full" disabled={isSending}>
              {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Resend Link
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline text-slate-500 hover:text-primary transition-colors">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
