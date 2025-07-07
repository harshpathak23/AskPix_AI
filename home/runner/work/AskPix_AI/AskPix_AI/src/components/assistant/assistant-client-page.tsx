
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Loader2, Send, Sparkles, Home, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MathRenderer } from '@/components/math-renderer';

const AssistantFormSchema = z.object({
  prompt: z
    .string()
    .min(10, { message: 'Please enter at least 10 characters.' })
    .max(30000, { message: 'Input cannot exceed 30,000 characters.' }),
});

type AssistantFormValues = z.infer<typeof AssistantFormSchema>;

export default function AssistantClientPage() {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AssistantFormValues>({
    resolver: zodResolver(AssistantFormSchema),
  });

  const onSubmit = async (data: AssistantFormValues) => {
    setError(null);
    setResponse(null);
    try {
      const apiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.prompt }),
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ error: 'An unknown error occurred.' }));
        throw new Error(errorData.error || `API request failed with status ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      setResponse(result.response);
    } catch (e) {
      console.error('Assistant Error:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Failed to get a response from the assistant.',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="font-bold text-xl text-slate-100">AskPix AI</h1>
            <Button asChild size="icon">
                <Link href="/">
                    <Home />
                </Link>
            </Button>
        </header>

        <Card className="bg-slate-800/30 border-purple-900/50 text-slate-200 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2 text-2xl">
              <Sparkles className="text-primary" /> Gemini Pro Assistant
            </CardTitle>
            <CardDescription className="text-slate-400">
              Paste up to 30,000 characters and get a helpful, concise response from Gemini Pro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Textarea
                {...register('prompt')}
                placeholder="Enter your long text or prompt here..."
                className="min-h-[200px] bg-slate-900/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary text-base"
              />
              {errors.prompt && <p className="text-sm text-red-400">{errors.prompt.message}</p>}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Send /> Get Response
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {isSubmitting && (
             <Card className="mt-6 bg-slate-800/30 border-purple-900/50 text-slate-200 backdrop-blur-sm animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                        <Bot className="animate-pulse" /> Generating Response...
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-400">Please wait while the assistant processes your request.</p>
                </CardContent>
            </Card>
        )}

        {error && (
            <Alert variant="destructive" className="mt-6 bg-gradient-to-br from-rose-500 to-red-900 border-rose-400 text-white">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {response && (
          <Card className="mt-6 bg-slate-800/30 border-purple-900/50 text-slate-200 backdrop-blur-sm animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2 text-2xl">
                <Bot /> Assistant's Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MathRenderer text={response} />
            </CardContent>
          </Card>
        )}

      </div>
    </main>
  );
}
