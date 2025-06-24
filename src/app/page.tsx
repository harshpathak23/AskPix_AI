'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, ScanLine, XCircle, Bot, Atom, FunctionSquare, TestTube, Dna, Zap, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


import { Button } from '@/components/ui/button';
import { getSolution } from './actions';
import { Logo } from '@/components/icons/logo';
import { SolutionSkeleton } from '@/components/solution-skeleton';
import { SolutionDisplay } from '@/components/solution-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GraphData } from '@/ai/schemas';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [flashSupported, setFlashSupported] = useState(false);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // This effect now ONLY handles cleaning up the camera stream when leaving the scanning screen.
  useEffect(() => {
    const videoElement = videoRef.current;
    if (appState !== 'scanning' && videoElement?.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }, [appState]);

  const startCamera = async () => {
    // Immediately switch to scanning view to show loading state
    setAppState('scanning');
    
    // Reset states for a new camera session
    setHasCameraPermission(null);
    setError(null);
    setFlashSupported(false);
    setZoomSupported(false);
    setIsFlashOn(false);
    setZoomLevel(1);


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
            const [track] = stream!.getVideoTracks();
            const capabilities = track.getCapabilities();

            if (capabilities.torch) {
              setFlashSupported(true);
            }
            if (capabilities.zoom) {
              setZoomSupported(true);
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

  const toggleFlash = async () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const [track] = stream.getVideoTracks();
      if (track) {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn }],
        });
        setIsFlashOn(!isFlashOn);
      }
    }
  };

  const handleZoomChange = async (value: number[]) => {
    const newZoom = value[0];
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities();
      if (capabilities.zoom) {
        const minZoom = capabilities.zoom.min!;
        const maxZoom = capabilities.zoom.max!;
        const scaledZoom = minZoom + (maxZoom - minZoom) * ((newZoom - 1) / 9);
        await track.applyConstraints({
          advanced: [{ zoom: scaledZoom }],
        });
        setZoomLevel(newZoom);
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

  const AppHeader = () => (
    <header className="text-center">
      <Logo className="w-full aspect-square mx-auto" />
      <p className="mt-2 text-sm text-muted-foreground">Build By Harsh Pathak</p>
    </header>
  );

  const renderWelcomeScreen = () => (
    <div className="w-full h-full flex flex-col justify-between text-center pt-0">
      {/* Top section */}
      <div>
        <div className="w-full max-w-xs mx-auto">
          <AppHeader />
        </div>
        <ScrollArea className="w-full px-4">
          <div className="w-full flex flex-col items-center pt-4">
            <p className="mb-4 text-xl font-medium">Choose a subject</p>
            <Tabs defaultValue={subject} onValueChange={(value) => setSubject(value as Subject)} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2 gap-4 h-auto p-0 bg-transparent">
                  <TabsTrigger value="Mathematics" className="flex-col h-28 text-lg gap-2 border shadow-sm rounded-lg data-[state=active]:ring-2 data-[state=active]:ring-primary data-[state=active]:shadow-lg">
                      <FunctionSquare className="h-8 w-8" />
                      <span>Math</span>
                  </TabsTrigger>
                  <TabsTrigger value="Physics" className="flex-col h-28 text-lg gap-2 border shadow-sm rounded-lg data-[state=active]:ring-2 data-[state=active]:ring-primary data-[state=active]:shadow-lg">
                      <Atom className="h-8 w-8" />
                      <span>Physics</span>
                  </TabsTrigger>
                  <TabsTrigger value="Chemistry" className="flex-col h-28 text-lg gap-2 border shadow-sm rounded-lg data-[state=active]:ring-2 data-[state=active]:ring-primary data-[state=active]:shadow-lg">
                      <TestTube className="h-8 w-8" />
                      <span>Chemistry</span>
                  </TabsTrigger>
                  <TabsTrigger value="Biology" className="flex-col h-28 text-lg gap-2 border shadow-sm rounded-lg data-[state=active]:ring-2 data-[state=active]:ring-primary data-[state=active]:shadow-lg">
                      <Dna className="h-8 w-8" />
                      <span>Biology</span>
                  </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
      
      {/* Bottom section: Button */}
      <div className="w-full max-w-sm self-center py-4 px-4 shrink-0">
          <Button onClick={handleStartScanning} size="lg" className="w-full text-lg py-7 px-8 animate-pulse-glow">
              <Camera className="mr-3 h-6 w-6" />
              Start Scanning
          </Button>
      </div>
    </div>
  );
  
  const renderScanningScreen = () => (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full h-full overflow-hidden relative flex items-center justify-center bg-black rounded-lg">
        {hasCameraPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white bg-black/50">
            <Camera className="h-16 w-16 mb-4 animate-pulse" />
            <p className="text-xl font-medium">Initializing Camera...</p>
            <p className="text-sm text-muted-foreground mt-2">Please allow camera permissions if prompted.</p>
          </div>
        )}
        
        <video ref={videoRef} className={cn("w-full h-full object-cover", hasCameraPermission !== true && "opacity-0")} autoPlay muted playsInline />
        
        {hasCameraPermission === true && (
          <>
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/70 shadow-[0_0_20px_5px_hsl(var(--primary))] animate-scan-line pointer-events-none" />

            <div className="absolute top-4 right-4 z-10 space-y-3">
              {flashSupported && (
                <Button onClick={toggleFlash} size="icon" variant={isFlashOn ? 'secondary' : 'ghost'} className="h-12 w-12 rounded-full backdrop-blur-sm bg-black/20 hover:bg-black/40 text-white">
                  <Zap className={cn(isFlashOn && "fill-yellow-300 text-yellow-300")} />
                </Button>
              )}
            </div>
             {zoomSupported && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-1/2 max-h-64 flex flex-col items-center space-y-2">
                <ZoomIn className="text-white/80"/>
                <Slider
                  defaultValue={[1]}
                  min={1}
                  max={10}
                  step={0.5}
                  onValueChange={handleZoomChange}
                  className="w-auto"
                  orientation="vertical"
                />
              </div>
            )}
          </>
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
              className="h-16 w-16 rounded-full animate-pulse-glow border-4 border-white/50"
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
                <p className="text-muted-foreground">Language:</p>
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
      <main className="container mx-auto flex max-w-3xl flex-1 flex-col px-4 z-10">
        <div className="w-full flex flex-1 flex-col items-stretch">
          <div className="w-full flex-1 flex flex-col px-4 pb-0 rounded-xl bg-card/80 backdrop-blur-sm border shadow-sm min-h-[70vh]">
            <div className="w-full flex-1 flex flex-col pt-0">
              {appState === 'welcome' && renderWelcomeScreen()}
              {appState === 'scanning' && renderScanningScreen()}
              {appState === 'cropping' && renderCroppingScreen()}
              {appState === 'solving' && renderSolvingScreen()}
              {appState === 'result' && renderResultScreen()}
            </div>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground z-10 flex items-center gap-2">
        <Bot size={16} /> Powered by Generative AI.
      </footer>
    </div>
  );
}
