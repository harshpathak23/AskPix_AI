
'use client';

import Link from 'next/link';
import { Mail, KeyRound, Loader2, XCircle, Send, CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, AuthError, sendPasswordResetEmail, sendEmailVerification, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';


const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

const LoginProgress = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Signing You In</h2>
        <p className="text-slate-400 mb-6">Please wait a moment...</p>
    </div>
);


export default function LoginClientPage() {
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const router = useRouter();
  
  // State for Phone Auth
  const [phone, setPhone] = useState<string | undefined>('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);


  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });
  
  useEffect(() => {
    if (auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  const handleSuccessfulLogin = () => {
    const pendingSolution = localStorage.getItem('pendingSolution');
    if (pendingSolution) {
      router.push('/');
    } else {
      router.push('/profile');
    }
  };

  const onEmailSubmit = async (data: LoginFormValues) => {
    setError(null);
    setResetEmailSent(false);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      if (!userCredential.user.emailVerified) {
          setError("Please verify your email address to continue. Check your inbox for a verification link.");
          await sendEmailVerification(userCredential.user);
          router.push('/verify-email');
          return;
      }
      handleSuccessfulLogin();
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
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSendOtp = async () => {
    setPhoneError(null);
    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError('Please enter a valid phone number.');
      return;
    }
    setIsSendingOtp(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (e) {
      console.error(e);
      setPhoneError('Failed to send OTP. Please check the number or try again later.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setPhoneError(null);
    if (!otp || otp.length !== 6) {
      setPhoneError('Please enter a valid 6-digit OTP.');
      return;
    }
    if (!confirmationResult) {
      setPhoneError('Please request an OTP first.');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await confirmationResult.confirm(otp);
      handleSuccessfulLogin();
    } catch (e) {
      console.error(e);
      setPhoneError('Invalid OTP or it has expired. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <div id="recaptcha-container"></div>
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
          {(isSubmitting || isVerifyingOtp) ? (
            <LoginProgress />
          ) : (
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4 pt-4">
                {error && (
                  <Alert variant="destructive" className="bg-gradient-to-br from-rose-500 to-red-900 border-rose-400 text-white">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {resetEmailSent && (
                  <Alert className="mb-4 bg-green-900/50 border-green-500/50 text-white">
                    <Send className="h-4 w-4" />
                    <AlertTitle>Check Your Email</AlertTitle>
                    <AlertDescription>A password reset link has been sent.</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
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
                      <button type="button" onClick={handleForgotPassword} disabled={isSendingReset} className="text-sm text-primary hover:underline">
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input id="password" type="password" {...register('password')} required className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary" />
                    </div>
                    {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full text-base py-6" disabled={isSubmitting}>
                    Login
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="phone" className="space-y-4 pt-4">
                 {phoneError && (
                  <Alert variant="destructive" className="bg-gradient-to-br from-rose-500 to-red-900 border-rose-400 text-white">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{phoneError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-400">Phone Number</Label>
                  <div className="relative flex items-center bg-slate-800/70 border border-slate-700 rounded-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <PhoneInput
                      international
                      defaultCountry="US"
                      value={phone}
                      onChange={setPhone}
                      className="pl-10 w-full"
                      disabled={isSendingOtp || !!confirmationResult}
                    />
                  </div>
                </div>

                {confirmationResult ? (
                  <div className="space-y-4 animate-in fade-in-50">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-slate-400">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <Button onClick={handleVerifyOtp} className="w-full text-base py-6" disabled={isVerifyingOtp}>
                      {isVerifyingOtp ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleSendOtp} className="w-full" disabled={isSendingOtp}>
                    {isSendingOtp ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                  </Button>
                )}
              </TabsContent>

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
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
