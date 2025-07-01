'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/icons/logo";

const ProfileClientPage = dynamic(
  () => import('@/components/profile/profile-client-page'),
  {
    ssr: false,
    loading: () => (
       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div className="font-bold text-xl text-slate-100 flex items-center gap-2">
                    <Logo className="h-[150px] w-auto aspect-[9/16]" />
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </header>
            
            <div className="flex items-center gap-6 mb-8">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
            </div>

            <Card className="bg-slate-800/30 border-purple-900/50">
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-80" /></CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full rounded-lg" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    ),
  }
);

export default function ProfilePage() {
  return <ProfileClientPage />;
}
