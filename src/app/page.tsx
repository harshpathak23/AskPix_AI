'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, ScanLine, XCircle, Bot, Atom, FunctionSquare, TestTube, Globe, Dna, Zap } from 'lucide-react';
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
import { Slider } from '@/components/ui/slider';
import type { GraphData } from '@/ai/schemas';
import { cn } from '@/lib/utils';

// Define the states for our app's screen flow
type AppState = 'welcome' | 'scanning' | 'cropping' | 'solving' | 'result';

type Subject = 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology';
type Language = 'en' | 'hi';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [solution, setSolution] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [language, setLanguage] = useState<Language>('en');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFlashAvailable, setIsFlashAvailable] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  // This effect now ONLY handles cleaning up the camera stream when leaving the scanning screen.
  useEffect(() => {
    const videoElement = videoRef.current;
    if (appState !== 'scanning' && videoElement?.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }, [appState]);

  // This effect handles applying zoom changes.
  useEffect(() => {
    if (appState !== 'scanning' || !videoRef.current?.srcObject || !zoomRange) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const videoTrack = stream.getVideoTracks()?.[0];

    if (videoTrack) {
        // @ts-ignore
        videoTrack.applyConstraints({
            advanced: [{ zoom: zoom }]
        }).catch(e => {
            console.error("Failed to apply zoom", e);
        });
    }
  }, [zoom, appState, zoomRange]);

  const startCamera = async () => {
    // Immediately switch to scanning view to show loading state
    setAppState('scanning');
    
    // Reset states for a new camera session
    setIsFlashAvailable(false);
    setIsFlashOn(false);
    setZoom(1);
    setZoomRange(null);
    setHasCameraPermission(null);
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported by your browser.");
        setHasCameraPermission(false);
        return;
    }

    const constraintsToTry: MediaStreamConstraints[] = [
      { video: { facingMode: 'environment', width: { ideal: 3840 }, height: { ideal: 2160 } } }, // 4K
      { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } }, // Full HD
      { video: { facingMode: 'environment' } } // Default
    ];

    let stream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintsToTry) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Successfully got camera stream with constraints:", constraints);
        break; // Success!
      } catch (err) {
        lastError = err;
        console.warn("Failed to get stream with constraints:", constraints, "Error:", err);
      }
    }

    if (!stream) {
      console.error("All camera requests failed:", lastError);
      setHasCameraPermission(false);
      if (lastError instanceof Error && (lastError.name === 'NotAllowedError' || lastError.name === 'PermissionDeniedError')) {
          setError('Camera access was denied. Please enable camera permissions in your browser settings.');
      } else {
          setError('Could not access the camera. It may be in use, not available, or not supported.');
      }
      return;
    }
    
    const video = videoRef.current;
    if (video) {
        video.srcObject = stream;
        // This is the robust way to wait for the camera to be ready.
        video.onloadedmetadata = () => {
            setHasCameraPermission(true);
            const videoTrack = stream.getVideoTracks()?.[0];
            if (videoTrack) {
                try {
                    const capabilities = videoTrack.getCapabilities();
                    const settings = videoTrack.getSettings();
                    // @ts-ignore
                    if (capabilities.torch) {
                      setIsFlashAvailable(true);
                      // @ts-ignore
                      setIsFlashOn(!!settings.torch);
                    }
                    // @ts-ignore
                    if (capabilities.zoom) {
                        // @ts-ignore
                        const { min, max, step } = capabilities.zoom;
                        setZoomRange({ min, max, step });
                        // @ts-ignore
                        setZoom(settings.zoom || min);
                    }
                } catch (e) {
                    console.error("Error reading camera capabilities:", e);
                }
            }
        };
    }
  };

  const handleStartScanning = async () => {
    // Reset all previous results and states
    setCapturedImage(null);
    setCroppedImage(null);
    setSolution(null);
    setGraphData(null);
    setError(null);
    setLanguage('en');
    setCrop(undefined);
    await startCamera();
  };

  const handleRetake = async () => {
    await handleStartScanning();
  };

  const handleToggleFlash = async () => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const videoTrack = stream.getVideoTracks()?.[0];

    if (videoTrack && isFlashAvailable) {
      try {
        await videoTrack.applyConstraints({
          // @ts-ignore
          advanced: [{ torch: !isFlashOn }],
        });
        setIsFlashOn(!isFlashOn);
      } catch (e) {
        console.error("Failed to toggle flash", e);
        toast({
          variant: "destructive",
          title: "Flash Error",
          description: "Could not toggle the flashlight.",
        });
      }
    }
  };

  function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    canvas.width = Math.floor(cropWidth);
    canvas.height = Math.floor(cropHeight);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return Promise.reject(new Error('Failed to get canvas context'));
    }
  
    ctx.imageSmoothingQuality = 'high';
  
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    return new Promise((resolve) => {
      // Use PNG for lossless image quality
      resolve(canvas.toDataURL('image/png'));
    });
  }

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
      } else if (response.solution) {
        setSolution(response.solution);
        setGraphData(response.graphData || null);
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
      // Keep previous solution steps visible on translation error
    } else if (response.solution) {
      setSolution(response.solution);
      setGraphData(response.graphData || null);
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
        // Use PNG for lossless image quality
        const dataUri = canvas.toDataURL('image/png');
        setCapturedImage(dataUri);
        setCroppedImage(null);
        setSolution(null);
        setGraphData(null);
        setError(null);
        setLanguage('en');
        setAppState('cropping');
      }
    }
  };
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: 'px', // Use pixels for more reliable cropping
          width: width * 0.9,
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
      <h2 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl flex items-center gap-4">
        <Logo className="h-16 w-16" />
        AskPix AI
      </h2>
      <p className="mt-8 max-w-xl text-lg text-muted-foreground">
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
      <div className="w-full flex-1 overflow-hidden relative flex items-center justify-center bg-black">
        {hasCameraPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white bg-black/50">
            <Camera className="h-16 w-16 mb-4 animate-pulse" />
            <p className="text-xl font-medium">Initializing Camera...</p>
            <p className="text-sm text-muted-foreground mt-2">Please allow camera permissions if prompted.</p>
          </div>
        )}
        
        <video ref={videoRef} className={cn("w-full h-full object-contain", hasCameraPermission !== true && "opacity-0")} autoPlay muted playsInline />
        
        {hasCameraPermission === true && zoomRange && (
            <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 h-1/2 w-10 flex flex-col items-center justify-center bg-black/30 rounded-full p-2 backdrop-blur-sm">
                <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={zoomRange.min}
                    max={zoomRange.max}
                    step={zoomRange.step}
                    orientation="vertical"
                    className="h-full"
                />
            </div>
        )}

        {hasCameraPermission === true && isFlashAvailable && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={handleToggleFlash}
              size="icon"
              variant={isFlashOn ? "default" : "secondary"}
              className="rounded-full h-12 w-12 text-yellow-300"
            >
              <Zap className="h-6 w-6" />
            </Button>
          </div>
        )}

        {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
               <Alert variant="destructive" className="w-11/12">
                  <Camera className="h-4 w-4" />
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    {error ? error : "Please allow camera access in your browser to use this feature."}
                  </AlertDescription>
                </Alert>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <Button
              onClick={handleScan}
              size="icon"
              className="h-16 w-16 rounded-full animate-pulse-glow"
              disabled={hasCameraPermission !== true}
            >
              <ScanLine className="h-8 w-8" />
            </Button>
        </div>
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
            onChange={(c, percentCrop) => setCrop(c)}
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
        <SolutionSkeleton subject={subject} />
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
              <SolutionSkeleton subject={subject} />
            ) : solution ? (
              <SolutionDisplay
                solution={solution}
                graphData={graphData}
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
              <Logo className="h-10 w-10" />
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
              AskPix AI
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
