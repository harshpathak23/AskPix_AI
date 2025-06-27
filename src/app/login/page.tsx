'use client';

import Link from 'next/link';
import { Mail, KeyRound, Loader2, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, AuthError, sendPasswordResetEmail } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setResetEmailSent(false);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/profile');
    } catch (e) {
      const authError = e as AuthError;
      let errorMessage = 'An unexpected error occurred. Please try again.';
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please try again.';
            break;
        case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
        case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.';
            break;
        default:
            console.error(authError);
            break;
      }
      setError(errorMessage);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetEmailSent(false);
    
    const email = getValues("email");
    // Simple validation, since this isn't part of the main form submission
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address in the email field to reset your password.");
      return;
    }
    
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (e) {
      const authError = e as AuthError;
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-email') {
        setError(`We couldn't find an account for ${email}. Please check the email address and try again.`);
      } else {
        setError("An error occurred while sending the reset email. Please try again.");
        console.error('Password Reset Error:', authError);
      }
    } finally {
      setIsSendingReset(false);
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
          <CardTitle className="text-3xl font-bold text-slate-100">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400 pt-1">
            Sign in to download and save your solutions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-500/50 text-white">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {resetEmailSent && (
            <Alert className="mb-4 bg-green-900/50 border-green-500/50 text-white">
              <Send className="h-4 w-4" />
              <AlertTitle>Check Your Email</AlertTitle>
              <AlertDescription>
                A password reset link has been sent to your email address.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="email" type="email" placeholder="m@example.com" {...register('email')} className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary" />
              </div>
              {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password"  className="text-slate-400">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSendingReset || isSubmitting}
                  className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingReset ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Sending...
                    </span>
                  ) : "Forgot Password?"}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="password" type="password" {...register('password')} required className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary" />
              </div>
              {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full text-base py-6" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline text-primary font-semibold">
              Sign up
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/" className="underline text-slate-500 hover:text-primary transition-colors">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
