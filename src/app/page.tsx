'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { getSolution } from './actions';
import { Logo } from '@/components/icons/logo';
import { SolutionSkeleton } from '@/components/solution-skeleton';
import { SolutionDisplay } from '@/components/solution-display';

const FormSchema = z.object({
  question: z
    .string()
    .min(10, {
      message: 'Question must be at least 10 characters.',
    })
    .max(2000, {
      message: 'Question must not be longer than 2000 characters.',
    }),
  language: z.enum(['en', 'hi'], {
    required_error: 'You need to select a language.',
  }),
});

type SolutionState = {
  question: string;
  solution: string;
} | null;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SolutionState>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: '',
      language: 'en',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    const response = await getSolution(data);
    if (response.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error,
      });
    } else if (response.solution) {
      setResult({ question: data.question, solution: response.solution });
    }
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background dark:bg-grid-white/[0.05] bg-grid-black/[0.02] relative">
       <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <main className="container mx-auto flex max-w-3xl flex-1 flex-col items-center px-4 py-8 md:py-12 z-10">
        <header className="flex flex-col items-center text-center mb-8">
           <div className="p-3 mb-4 bg-primary/10 rounded-full border-8 border-background">
             <Logo className="h-10 w-10 text-primary" />
           </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            ScanSolve
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Stuck on a problem? Enter any Math, Physics, or Chemistry
            question and get a detailed, step-by-step solution in seconds.
          </p>
        </header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Your Question
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. 'What is the integral of x^2?' or paste your full question here..."
                      className="min-h-[120px] resize-none text-base bg-card"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold">
                    Solution Language
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="en" />
                        </FormControl>
                        <FormLabel className="font-normal">English</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="hi" />
                        </FormControl>
                        <FormLabel className="font-normal">हिंदी (Hindi)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Solving...
                  </>
                ) : (
                  'Solve Question'
                )}
              </Button>
               <Button
                variant="outline"
                className="w-full text-lg py-6"
                onClick={() => toast({ title: "Coming Soon!", description: "The history feature is under development."})}
                type="button"
              >
                View History
              </Button>
            </div>
          </form>
        </Form>
        
        {isLoading && <SolutionSkeleton />}
        {result && (
          <SolutionDisplay
            question={result.question}
            solution={result.solution}
          />
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground z-10">
        Powered by AI. Solutions may not always be perfect.
      </footer>
    </div>
  );
}
