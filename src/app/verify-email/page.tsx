'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const VerifyEmailClientPage = dynamic(
  () => import('@/components/auth/verify-email-client-page'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    ),
  }
);

export default function VerifyEmailPage() {
  return <VerifyEmailClientPage />;
}
