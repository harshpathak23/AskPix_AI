import Link from 'next/link';
import { Mail, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AskPixLogo } from '@/components/icons/askpix-logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#2a0a4a] p-4">
      <Card className="w-full max-w-sm bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg border-white/20 text-slate-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <AskPixLogo className="text-slate-300" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400 pt-1">
            Sign in to download and save your solutions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="email" type="email" placeholder="m@example.com" required className="pl-10 bg-white/90 text-slate-900 placeholder:text-slate-500 border-transparent focus:bg-white focus:border-purple-500 focus:ring-purple-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password"  className="text-slate-400">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input id="password" type="password" required className="pl-10 bg-white/90 text-slate-900 placeholder:text-slate-500 border-transparent focus:bg-white focus:border-purple-500 focus:ring-purple-500" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#8220FF] hover:bg-[#8f3bff] text-white text-base py-6">
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline text-white font-semibold">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
