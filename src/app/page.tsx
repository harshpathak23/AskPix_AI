'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, ScanLine, XCircle, Bot, Atom, FunctionSquare, TestTube, Globe } from 'lucide-react';
import Image from 'next/image';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getSolution } from './actions';
import { Logo } from '@/components/icons/logo';
import { SolutionSkeleton } from '@/components/solution-skeleton';
import { SolutionDisplay } from '@/components/solution-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SolutionState = {
  question: string;
  solutionSteps: string[];
} | null;

type Subject = 'Mathematics' | 'Physics' | 'Chemistry';
type Language = 'en' | 'hi';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SolutionState>(null);
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [language, setLanguage] = useState<Language>('en');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const stopStream = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };

    const startStream = async () => {
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
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
        setError(null);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setError('Camera access was denied. Please enable camera permissions in your browser settings to use this feature.');
      }
    };

    if (!capturedImage) {
      startStream();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [capturedImage, toast]);

  function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return Promise.reject(new Error('Failed to get canvas context'));
    }
  
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
  
    return new Promise((resolve) => {
      resolve(canvas.toDataURL('image/png'));
    });
  }

  const handleGetSolution = async () => {
    if (!crop || !imgRef.current || !crop.width || !crop.height) {
      setError("Please select an area to crop before getting a solution.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const croppedDataUri = await getCroppedImg(imgRef.current, crop);
      setCroppedImage(croppedDataUri);

      const response = await getSolution({ 
        photoDataUri: croppedDataUri, 
        language,
        subject 
      });
      
      if (response.error) {
        setError(response.error);
        setResult(null);
      } else if (response.solutionSteps) {
        setResult({ question: croppedDataUri, solutionSteps: response.solutionSteps });
      }
    } catch (e) {
      console.error("Cropping or solving failed", e);
      setError("Failed to process the image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (!croppedImage) {
      setError("Cannot change language without a solved question.");
      return;
    }
    
    setIsLoading(true);
    setResult(null); 
    setError(null);
    setLanguage(newLang);

    const response = await getSolution({ 
      photoDataUri: croppedImage, 
      language: newLang, 
      subject 
    });
    
    if (response.error) {
      setError(response.error);
    } else if (response.solutionSteps) {
      setResult({ question: croppedImage, solutionSteps: response.solutionSteps });
    }
    
    setIsLoading(false);
  };

  const handleScan = () => {
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
        setCroppedImage(null);
        setResult(null);
        setError(null);
        setLanguage('en');
      }
    }
  };
  
  const handleRetake = () => {
    setCapturedImage(null);
    setCroppedImage(null);
    setResult(null);
    setIsLoading(false);
    setError(null);
    setLanguage('en');
    setCrop(undefined);
  };
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        16 / 9,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }

  const renderCameraView = () => (
    <div className="w-full space-y-6 flex flex-col items-center">
      <div className="w-full aspect-video bg-card/50 backdrop-blur-sm border rounded-lg overflow-hidden relative flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-cover transform scale-150" autoPlay muted playsInline />
        <div className="absolute inset-0 bg-black/20" />
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

       <div className="space-y-4 text-center">
          <label className="text-lg font-semibold text-primary-foreground">
            Select Subject
          </label>
          <Tabs defaultValue={subject} onValueChange={(value) => setSubject(value as Subject)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card/80 backdrop-blur-sm">
              <TabsTrigger value="Mathematics"><FunctionSquare className="mr-2" />Math</TabsTrigger>
              <TabsTrigger value="Physics"><Atom className="mr-2" />Physics</TabsTrigger>
              <TabsTrigger value="Chemistry"><TestTube className="mr-2" />Chem</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      <Button
        onClick={handleScan}
        size="lg"
        className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-2xl shadow-primary/40 animate-pulse-glow"
        disabled={isLoading || hasCameraPermission !== true}
      >
        <ScanLine className="h-10 w-10" />
      </Button>
    </div>
  );

  const renderCroppingView = () => (
    <div className="w-full space-y-6 flex flex-col items-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-foreground">Crop Your Question</h2>
        <p className="text-muted-foreground">Drag to select the area with the question you want to solve.</p>
      </div>
      <div className="w-full bg-card/50 backdrop-blur-sm border rounded-lg overflow-hidden relative flex items-center justify-center">
        {capturedImage && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            aspect={undefined}
          >
            <Image
              ref={imgRef}
              src={capturedImage}
              alt="Captured question to crop"
              width={1200}
              height={675}
              onLoad={onImageLoad}
              className="w-full h-auto"
            />
          </ReactCrop>
        )}
      </div>
      <div className="flex w-full gap-4">
        <Button onClick={handleRetake} variant="outline" className="w-full text-lg py-6" disabled={isLoading}>
          <RefreshCw className="mr-2 h-5 w-5" />
          Retake
        </Button>
        <Button onClick={handleGetSolution} className="w-full text-lg py-6" disabled={isLoading || !crop?.width || !crop?.height}>
          <Bot className="mr-2 h-5 w-5" />
          Get Solution
        </Button>
      </div>
    </div>
  );
  
  const renderResultImageView = () => (
    <div className="w-full space-y-6">
        <div className="w-full aspect-video bg-card/50 backdrop-blur-sm border rounded-lg overflow-hidden relative flex items-center justify-center">
            {croppedImage && <Image src={croppedImage} alt="Cropped question" fill className="object-contain" />}
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
    <div className="flex min-h-screen w-full flex-col items-center bg-background dark selection:bg-primary/40">
      <main className="container mx-auto flex max-w-7xl flex-1 flex-col items-center px-4 py-8 md:py-12 z-10">
        <header className="flex flex-col items-center text-center mb-8">
           <div className="p-3 mb-4 bg-primary/20 rounded-full border-8 border-background/50 shadow-lg">
             <Logo className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl bg-clip-text text-transparent bg-gradient-to-br from-gray-200 to-gray-400">
            ScanSolve
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Stuck on a problem? Scan any Math, Physics, or Chemistry
            question and get a detailed, step-by-step solution in seconds.
          </p>
        </header>

        {error && !isLoading && (
            <Alert variant="destructive" className="mb-4 w-full">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="w-full flex flex-col md:flex-row items-start gap-8 mt-4">
          {/* Left Column */}
          <div className="w-full md:w-3/5 flex-shrink-0">
            <div className="p-4 md:p-6 rounded-xl bg-card/50 backdrop-blur-sm border shadow-2xl min-h-[400px] flex flex-col justify-center">
              {!capturedImage ? (
                renderCameraView()
              ) : !croppedImage ? (
                renderCroppingView()
              ) : (
                renderResultImageView()
              )}
            </div>
          </div>
          
          {/* Right Column */}
          <div className="w-full md:w-2/5 flex-shrink-0">
              {isLoading ? (
                <SolutionSkeleton />
              ) : result ? (
                <div className="w-full animate-in fade-in-50 duration-500">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Globe className="text-muted-foreground" size={20} />
                    <Tabs defaultValue={language} onValueChange={(value) => handleLanguageChange(value as Language)} className="w-auto">
                      <TabsList>
                        <TabsTrigger value="en">English</TabsTrigger>
                        <TabsTrigger value="hi">Hindi</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <SolutionDisplay
                    solutionSteps={result.solutionSteps}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl bg-card/50 backdrop-blur-sm border shadow-lg text-muted-foreground min-h-[400px]">
                  <Bot size={48} className="mb-4 text-primary" />
                  <h3 className="text-xl font-semibold text-primary-foreground">Solution Awaits</h3>
                  <p>Scan a problem, and the step-by-step solution will appear here.</p>
                </div>
              )}
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground z-10 flex items-center gap-2">
        <Bot size={16} /> Powered by Generative AI.
      </footer>
    </div>
  );
}
