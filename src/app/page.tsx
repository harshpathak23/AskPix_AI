'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, ScanLine, XCircle, Bot, Atom, FunctionSquare, TestTube, Globe, Dna } from 'lucide-react';
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

// Define the states for our app's screen flow
type AppState = 'welcome' | 'scanning' | 'cropping' | 'solving' | 'result';

type Subject = 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology';
type Language = 'en' | 'hi';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [solutionSteps, setSolutionSteps] = useState<string[] | null>(null);
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [language, setLanguage] = useState<Language>('en');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
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
    
    if (appState === 'scanning') {
      startStream();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [appState, toast]);

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
  
    ctx.imageSmoothingQuality = 'high';
  
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    return new Promise((resolve) => {
      resolve(canvas.toDataURL('image/png'));
    });
  }

  const handleStartScanning = () => {
    setCapturedImage(null);
    setCroppedImage(null);
    setSolutionSteps(null);
    setError(null);
    setLanguage('en');
    setCrop(undefined);
    setAppState('scanning');
  };
  
  const handleGetSolution = async () => {
    if (!crop || !imgRef.current || !crop.width || !crop.height) {
      setError("Please select an area to crop before getting a solution.");
      return;
    }

    setAppState('solving');
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
        setAppState('cropping');
      } else if (response.solutionSteps) {
        setSolutionSteps(response.solutionSteps);
        setAppState('result');
      }
    } catch (e) {
      console.error("Cropping or solving failed", e);
      setError("Failed to process the image. Please try again.");
      setAppState('cropping');
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (!croppedImage) {
      setError("Cannot change language without a solved question.");
      return;
    }
    
    setIsTranslating(true);
    setError(null);
    setLanguage(newLang);

    const response = await getSolution({ 
      photoDataUri: croppedImage, 
      language: newLang, 
      subject 
    });
    
    if (response.error) {
      setError(response.error);
      setSolutionSteps(null); // Clear previous solution on error
    } else if (response.solutionSteps) {
      setSolutionSteps(response.solutionSteps);
    }
    
    setIsTranslating(false);
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
        setSolutionSteps(null);
        setError(null);
        setLanguage('en');
        setAppState('cropping');
      }
    }
  };
  
  const handleRetake = () => {
    setCapturedImage(null);
    setCroppedImage(null);
    setSolutionSteps(null);
    setError(null);
    setLanguage('en');
    setCrop(undefined);
    setAppState('scanning');
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

  const renderWelcomeScreen = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in-50 duration-500">
      <div className="p-4 mb-6 bg-card rounded-full border-8 border-background shadow-lg">
        <Logo className="h-16 w-16 text-primary" />
      </div>
      <h2 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">Welcome to ScanSolve</h2>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Get instant, step-by-step solutions for Math, Physics, Chemistry, and Biology problems.
      </p>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Just point your camera, scan a question, and let our AI do the rest.
      </p>
      <Button onClick={handleStartScanning} size="lg" className="mt-8 text-lg py-7 px-8 animate-pulse-glow">
        <Camera className="mr-3 h-6 w-6" />
        Start Scanning
      </Button>
    </div>
  );
  
  const renderScanningScreen = () => (
    <div className="w-full h-full flex flex-col">
       <div className="w-full text-center mb-4">
        <Tabs defaultValue={subject} onValueChange={(value) => setSubject(value as Subject)} className="w-full inline-block max-w-sm">
          <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-sm border">
            <TabsTrigger value="Mathematics"><FunctionSquare className="mr-2" />Math</TabsTrigger>
            <TabsTrigger value="Physics"><Atom className="mr-2" />Physics</TabsTrigger>
            <TabsTrigger value="Chemistry"><TestTube className="mr-2" />Chem</TabsTrigger>
            <TabsTrigger value="Biology"><Dna className="mr-2" />Biology</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="w-full flex-1 bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        {hasCameraPermission === false && !error && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
               <Alert variant="destructive" className="w-11/12">
                  <Camera className="h-4 w-4" />
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser to use this feature.
                  </AlertDescription>
                </Alert>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="w-full pt-6 flex justify-center items-center">
        <Button
          onClick={handleScan}
          size="lg"
          className="h-16 w-16 rounded-full animate-pulse-glow"
          disabled={hasCameraPermission !== true}
        >
          <ScanLine className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );

  const renderCroppingScreen = () => (
    <div className="w-full h-full flex flex-col items-center">
       {error && (
          <Alert variant="destructive" className="mb-4 w-full">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
       )}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Crop Your Question</h2>
        <p className="text-muted-foreground">Drag to select the area with the question you want to solve.</p>
      </div>
      <div className="w-full flex-1 bg-muted border rounded-lg overflow-hidden relative flex items-center justify-center">
        {capturedImage && (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={undefined}
          >
            <Image
              ref={imgRef}
              src={capturedImage}
              alt="Captured question to crop"
              width={1200}
              height={675}
              onLoad={onImageLoad}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </ReactCrop>
        )}
      </div>
      <div className="flex w-full gap-4 mt-4">
        <Button onClick={handleRetake} variant="outline" className="w-full text-lg py-6">
          <RefreshCw className="mr-2 h-5 w-5" />
          Retake
        </Button>
        <Button onClick={handleGetSolution} className="w-full text-lg py-6" disabled={!crop?.width || !crop?.height}>
          <Bot className="mr-2 h-5 w-5" />
          Get Solution
        </Button>
      </div>
    </div>
  );
  
  const renderSolvingScreen = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
      <Bot size={64} className="mb-6 text-primary animate-bounce" />
      <h2 className="font-headline text-3xl font-bold tracking-tight">Solving your question...</h2>
      <p className="mt-2 max-w-md text-lg text-muted-foreground">
        Our AI tutor is analyzing the image. Please wait a few moments.
      </p>
      <div className='w-full max-w-lg mt-8'>
        <SolutionSkeleton />
      </div>
    </div>
  );
  
  const renderResultScreen = () => (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-500">
        <div className="w-full aspect-video bg-muted border rounded-lg overflow-hidden relative flex items-center justify-center">
            {croppedImage && <Image src={croppedImage} alt="Cropped question" fill className="object-contain" />}
        </div>
        
        {error && (
            <Alert variant="destructive" className="w-full">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        <div className="w-full">
            <div className="flex items-center justify-center gap-4 mb-4">
                <Globe className="text-muted-foreground" size={20} />
                <Tabs defaultValue={language} onValueChange={(value) => handleLanguageChange(value as Language)} className="w-auto">
                <TabsList>
                    <TabsTrigger value="en" disabled={isTranslating}>English</TabsTrigger>
                    <TabsTrigger value="hi" disabled={isTranslating}>Hindi</TabsTrigger>
                </TabsList>
                </Tabs>
            </div>
            {isTranslating ? (
              <SolutionSkeleton />
            ) : solutionSteps ? (
              <SolutionDisplay
                solutionSteps={solutionSteps}
              />
            ) : !error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl bg-card border shadow-sm min-h-[200px]">
                    <Bot size={48} className="mb-4 text-primary" />
                    <h3 className="text-xl font-semibold">Processing Error</h3>
                    <p className="text-muted-foreground">Could not generate a solution. Please try scanning again.</p>
                </div>
            ) : null}
        </div>

        <Button onClick={handleStartScanning} variant="outline" className="w-full text-lg py-6">
            <RefreshCw className="mr-2 h-5 w-5" />
            Scan Another Question
        </Button>
    </div>
  );
  

  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <main className="container mx-auto flex max-w-3xl flex-1 flex-col items-center px-4 py-8 md:py-12 z-10">
        {appState !== 'welcome' && (
          <header className="flex flex-col items-center text-center mb-8">
            <div className="p-3 mb-4 bg-card rounded-full border-8 border-background shadow-lg">
              <Logo className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
              ScanSolve
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Stuck on a problem? Scan any Math, Physics, Chemistry, or Biology
              question and get a detailed, step-by-step solution in seconds.
            </p>
          </header>
        )}

        <div className="w-full flex flex-1 flex-col items-stretch mt-4">
          <div className="w-full flex-1 flex flex-col p-4 md:p-6 rounded-xl bg-card/80 backdrop-blur-sm border shadow-sm min-h-[70vh] justify-center">
            {appState === 'welcome' && renderWelcomeScreen()}
            {appState === 'scanning' && renderScanningScreen()}
            {appState === 'cropping' && renderCroppingScreen()}
            {appState === 'solving' && renderSolvingScreen()}
            {appState === 'result' && renderResultScreen()}
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground z-10 flex items-center gap-2">
        <Bot size={16} /> Powered by Generative AI.
      </footer>
    </div>
  );
}
