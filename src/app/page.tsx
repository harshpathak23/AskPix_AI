'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, ScanLine, XCircle } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getSolution } from './actions';
import { Logo } from '@/components/icons/logo';
import { SolutionSkeleton } from '@/components/solution-skeleton';
import { SolutionDisplay } from '@/components/solution-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type SolutionState = {
  question: string; // Will hold the image data URI
  solution: string;
} | null;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SolutionState>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function getCameraPermission() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setError('Camera access was denied. Please enable camera permissions in your browser settings to use this feature.');
      }
    }
    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleScan = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/png');
        setCapturedImage(dataUri);
        
        setIsLoading(true);
        setResult(null);
        setError(null);
        const response = await getSolution({ photoDataUri: dataUri, language });
        if (response.error) {
          setError(response.error);
        } else if (response.solution) {
          setResult({ question: dataUri, solution: response.solution });
        }
        setIsLoading(false);
      }
    }
  };
  
  const handleRetake = () => {
    setCapturedImage(null);
    setResult(null);
    setIsLoading(false);
    setError(null);
  };
  
  const renderCameraView = () => (
    <div className="w-full space-y-6">
      <div className="w-full aspect-video bg-card border rounded-lg overflow-hidden relative flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        {hasCameraPermission === false && !error && (
           <Alert variant="destructive" className="w-11/12">
              <Camera className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser to use this feature.
              </AlertDescription>
            </Alert>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

       <div className="space-y-3">
          <Label className="text-lg font-semibold">
            Solution Language
          </Label>
          <RadioGroup
            onValueChange={(value: 'en' | 'hi') => setLanguage(value)}
            defaultValue={language}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="en" id="en" />
              <Label htmlFor="en" className="font-normal">English</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hi" id="hi" />
              <Label htmlFor="hi" className="font-normal">हिंदी (Hindi)</Label>
            </div>
          </RadioGroup>
        </div>

      <Button
        onClick={handleScan}
        className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
        disabled={isLoading || hasCameraPermission !== true}
      >
        <ScanLine className="mr-2 h-5 w-5" />
        Scan Question
      </Button>
    </div>
  );
  
  const renderImageView = () => (
    <div className="w-full space-y-6">
        <div className="w-full aspect-video bg-card border rounded-lg overflow-hidden relative flex items-center justify-center">
            {capturedImage && <Image src={capturedImage} alt="Captured question" fill className="object-contain" />}
        </div>
        <Button
            onClick={handleRetake}
            variant="outline"
            className="w-full text-lg py-6"
            disabled={isLoading}
        >
            <RefreshCw className="mr-2 h-5 w-5" />
            Scan Another Question
        </Button>
    </div>
  );

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
            Stuck on a problem? Scan any Math, Physics, or Chemistry
            question and get a detailed, step-by-step solution in seconds.
          </p>
        </header>

        <div className="w-full">
          {error && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {capturedImage ? renderImageView() : renderCameraView()}
        </div>
        
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
