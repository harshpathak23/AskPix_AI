'use client';

import Link from 'next/link';
import { User, Mail, KeyRound, Loader2, XCircle } from 'lucide-react';
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
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SignupSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignupFormValues = z.infer<typeof SignupSchema>;


export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      router.push('/profile');
    } catch (e) {
      const authError = e as AuthError;
      let errorMessage = 'An unexpected error occurred. Please try again.';
      switch (authError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please choose a stronger password.';
          break;
        default:
          console.error(authError);
          break;
      }
      setError(errorMessage);
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
           {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-500/50 text-white">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Signup Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-400">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="name" placeholder="John Doe" {...register('name')} required className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary" />
              </div>
              {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="email" type="email" placeholder="m@example.com" {...register('email')} required className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary" />
              </div>
              {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password"  className="text-slate-400">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="password" type="password" {...register('password')} required className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary" />
              </div>
              {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full text-base py-6" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="underline text-primary font-semibold">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
