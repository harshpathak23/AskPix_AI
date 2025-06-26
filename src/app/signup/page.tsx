import Link from 'next/link';
import { User, Mail, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <Card className="w-full max-w-sm bg-slate-900/50 backdrop-blur-sm border-purple-900/50 text-slate-200">
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
          <form className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-400">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="name" placeholder="John Doe" required className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="email" type="email" placeholder="m@example.com" required className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password"  className="text-slate-400">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="password" type="password" required className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary" />
              </div>
            </div>
            <Button type="submit" className="w-full text-base py-6">
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
