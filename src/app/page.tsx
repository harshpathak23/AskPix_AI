
'use client';

import { useState, useRef, useEffect, FC } from 'react';
import Link from 'next/link';
import { Camera, RefreshCw, ScanLine, XCircle, Bot, Atom, FunctionSquare, TestTube, Dna, Zap, ZoomIn, BrainCircuit, NotebookText, Download, Loader2, LogOut, User, Check } from 'lucide-react';
import Image from 'next/image';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { signOut } from 'firebase/auth';


import { Button, buttonVariants } from '@/components/ui/button';
import { getSolution } from './actions';
import { Logo } from '@/components/icons/logo';
import { SolutionDisplay } from '@/components/solution-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { MathRenderer } from '@/components/math-renderer';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { auth, db } from '@/lib/firebase';
import { type User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, FirestoreError } from 'firebase/firestore';
import { useRouter, type AppRouterInstance } from 'next/navigation';
import { ToastAction } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';
import { SplashScreen } from '@/components/splash-screen';


// Define the states for our app's screen flow
type AppState = 'welcome' | 'scanning' | 'cropping' | 'solving' | 'result';

type Subject = 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' | 'General';
type Language = 'en' | 'hi';


interface WelcomeScreenProps {
  subject: Subject;
  setSubject: (subject: Subject) => void;
  handleStartScanning: () => void;
}
const WelcomeScreen: FC<WelcomeScreenProps> = ({ subject, setSubject, handleStartScanning }) => (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 rounded-2xl shadow-xl p-6 flex flex-col animate-in fade-in-50 duration-500 h-[95vh] min-h-[700px]">
      <div className="flex-shrink-0 pt-8 pb-4 flex flex-col items-center">
        <Logo animated className="h-[320px] w-[320px] mb-2" />
        <p className="text-xs text-slate-400 tracking-wider">Build By Harsh Pathak</p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Choose a subject</h1>
        </div>
        
        <Tabs defaultValue={subject} onValueChange={(value) => setSubject(value as Subject)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-3 h-auto p-0 bg-transparent">
              <TabsTrigger value="Mathematics" className="flex-col h-16 gap-1 bg-white/5 border-white/10 hover:bg-white/10 shadow-sm rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:border-transparent">
                  <FunctionSquare className="h-4 w-4" />
                  <span className="font-medium text-xs">Math</span>
              </TabsTrigger>
              <TabsTrigger value="Physics" className="flex-col h-16 gap-1 bg-white/5 border-white/10 hover:bg-white/10 shadow-sm rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:border-transparent">
                  <Atom className="h-4 w-4" />
                  <span className="font-medium text-xs">Physics</span>
              </TabsTrigger>
              <TabsTrigger value="Chemistry" className="flex-col h-16 gap-1 bg-white/5 border-white/10 hover:bg-white/10 shadow-sm rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:border-transparent">
                  <TestTube className="h-4 w-4" />
                  <span className="font-medium text-xs">Chemistry</span>
              </TabsTrigger>
              <TabsTrigger value="Biology" className="flex-col h-16 gap-1 bg-white/5 border-white/10 hover:bg-white/10 shadow-sm rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:border-transparent">
                  <Dna className="h-4 w-4" />
                  <span className="font-medium text-xs">Biology</span>
              </TabsTrigger>
              <TabsTrigger value="General" className="col-span-2 flex-col h-16 gap-1 bg-white/5 border-white/10 hover:bg-white/10 shadow-sm rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:border-transparent">
                  <BrainCircuit className="h-4 w-4" />
                  <span className="font-medium text-xs">General Question</span>
              </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-shrink-0 pt-4 pb-2">
        <Button onClick={handleStartScanning} size="lg" className="w-full text-lg py-6 animate-pulse-glow">
          <Camera className="mr-3 h-6 w-6" />
          Start Scanning
        </Button>
      </div>
    </div>
);

interface ScanningScreenProps {
  hasCameraPermission: boolean | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  error: string | null;
  flashSupported: boolean;
  isFlashOn: boolean;
  toggleFlash: () => void;
  zoomSupported: boolean;
  handleZoomChange: (value: number[]) => void;
  handleScan: () => void;
}
const ScanningScreen: FC<ScanningScreenProps> = ({ hasCameraPermission, videoRef, canvasRef, error, flashSupported, isFlashOn, toggleFlash, zoomSupported, handleZoomChange, handleScan }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
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

interface CroppingScreenProps {
  error: string | null;
  capturedImage: string | null;
  crop: Crop | undefined;
  setCrop: (crop: Crop) => void;
  imgRef: React.RefObject<HTMLImageElement>;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  handleRetake: () => void;
  handleGetSolution: () => void;
}
const CroppingScreen: FC<CroppingScreenProps> = ({ error, capturedImage, crop, setCrop, imgRef, onImageLoad, handleRetake, handleGetSolution }) => (
    <div className="w-full h-full flex flex-col items-center p-4 text-slate-200">
       {error && (
          <Alert variant="destructive" className="mb-4 w-full bg-gradient-to-br from-rose-500 to-red-900 border-rose-400 text-white">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
       )}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-slate-100">Crop Your Question</h2>
        <p className="text-slate-400">Drag to select the area with the question you want to solve.</p>
      </div>
      <div className="w-full flex-1 bg-black/20 border-slate-700/50 border rounded-lg overflow-hidden relative flex items-center justify-center">
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
        <Button onClick={handleRetake} className="w-full text-lg py-6">
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

interface SolvingScreenProps {
  croppedImage: string | null;
}

const solvingSteps = [
  { text: 'Analyzing image content...', icon: <ScanLine className="h-5 w-5 text-slate-400" /> },
  { text: 'Identifying academic subject...', icon: <BrainCircuit className="h-5 w-5 text-slate-400" /> },
  { text: 'Formulating step-by-step solution...', icon: <Bot className="h-5 w-5 text-slate-400" /> },
  { text: 'Formatting final answer...', icon: <NotebookText className="h-5 w-5 text-slate-400" /> },
];

const SolvingScreen: FC<SolvingScreenProps> = ({ croppedImage }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // This timer simulates the AI "thinking" through steps.
    const timers = solvingSteps.map((_, index) =>
      setTimeout(() => {
        setActiveStep(index + 1);
      }, (index + 1) * 1200) // Stagger the "completion" of each step
    );

    // Cleanup timers if the component unmounts
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-500 p-4 text-slate-200">
      <div className="w-full aspect-video bg-black/20 border-slate-700/50 border rounded-lg overflow-hidden relative flex items-center justify-center">
        {croppedImage && <Image src={croppedImage} alt="Cropped question" fill className="object-contain" />}
      </div>

      <Card className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 border-purple-900/50">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Bot className="animate-pulse" /> Generating Solution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {solvingSteps.map((step, index) => (
              <li key={index} className="flex items-center gap-4 transition-opacity duration-300" style={{ opacity: activeStep >= index ? 1 : 0.4 }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0">
                  {activeStep > index ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : activeStep === index ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={cn("font-medium", activeStep > index ? "text-slate-400 line-through" : "text-slate-200")}>
                  {step.text}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};


const translationSteps = [
  { text: 'Preparing content for translation...', icon: <Bot className="h-5 w-5 text-slate-400" /> },
  { text: 'Generating solution in new language...', icon: <BrainCircuit className="h-5 w-5 text-slate-400" /> },
  { text: 'Formatting final answer...', icon: <NotebookText className="h-5 w-5 text-slate-400" /> },
];

const TranslatingScreen: FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = translationSteps.map((_, index) =>
      setTimeout(() => {
        setActiveStep(index + 1);
      }, (index + 1) * 800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 border-purple-900/50">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Loader2 className="animate-spin" /> Translating Solution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {translationSteps.map((step, index) => (
              <li key={index} className="flex items-center gap-4 transition-opacity duration-300" style={{ opacity: activeStep >= index ? 1 : 0.4 }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0">
                  {activeStep > index ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : activeStep === index ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={cn("font-medium", activeStep > index ? "text-slate-400 line-through" : "text-slate-200")}>
                  {step.text}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

interface ResultScreenProps {
  user: FirebaseUser | null;
  croppedImage: string | null;
  identifiedSubject: Subject | null;
  subject: Subject;
  error: string | null;
  language: Language;
  isTranslating: boolean;
  handleLanguageChange: (newLang: Language) => void;
  solution: string | null;
  topic: string | null;
  formulas: string | null;
  handleStartScanning: () => void;
  handleSaveSolution: () => void;
  isSaving: boolean;
  solutionSaved: boolean;
  router: AppRouterInstance;
}
const ResultScreen: FC<ResultScreenProps> = ({ user, croppedImage, identifiedSubject, subject, error, language, isTranslating, handleLanguageChange, solution, topic, formulas, handleStartScanning, handleSaveSolution, isSaving, solutionSaved, router }) => (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-500 p-4 text-slate-200">
        <div className="mb-3">
            <div className="flex flex-col items-center text-center">
                <Logo className="h-[220px] w-auto mt-2" animated />
                <p className="text-xs text-slate-400 tracking-wider mt-2">Build By Harsh Pathak</p>
            </div>
        </div>
        
        <div className="w-full aspect-video bg-black/20 border-slate-700/50 border rounded-lg overflow-hidden relative flex items-center justify-center">
            {croppedImage && <Image src={croppedImage} alt="Cropped question" fill className="object-contain" />}
        </div>
        
        {identifiedSubject && identifiedSubject !== subject && (
            <Alert className="bg-slate-800/50 border-slate-700 text-slate-200">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <AlertTitle>Subject Correction</AlertTitle>
              <AlertDescription>
                You selected <strong>{subject}</strong>, but we detected a <strong>{identifiedSubject}</strong> question. We've provided the solution for {identifiedSubject}.
              </AlertDescription>
            </Alert>
        )}

        {error && (
            <Alert variant="destructive" className="w-full bg-gradient-to-br from-rose-500 to-red-900 border-rose-400 text-white">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        <div className="w-full">
            <div className="flex items-center justify-center gap-4 mb-4">
                <p className="text-slate-400">Language:</p>
                <Tabs defaultValue={language} onValueChange={(value) => handleLanguageChange(value as Language)} className="w-auto">
                <TabsList className="bg-white/5 text-slate-300">
                    <TabsTrigger value="en" disabled={isTranslating} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white">English</TabsTrigger>
                    <TabsTrigger value="hi" disabled={isTranslating} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white">Hindi</TabsTrigger>
                </TabsList>
                </Tabs>
            </div>
            {isTranslating ? (
              <TranslatingScreen />
            ) : solution ? (
                <div className="space-y-6">
                    <SolutionDisplay solution={solution} />
                    {formulas && (
                        <Card className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 border-purple-900/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-100">
                                    <NotebookText />
                                    Key Formulas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MathRenderer text={formulas} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : !error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl bg-slate-800 border border-slate-700 shadow-sm min-h-[200px]">
                    <Bot size={48} className="mb-4 text-primary" />
                    <h3 className="text-xl font-semibold">Processing Error</h3>
                    <p className="text-slate-400">Could not generate a solution. Please try scanning again.</p>
                </div>
            ) : null}
        </div>

        <div className="flex w-full gap-4">
          <Button onClick={handleStartScanning} className="w-full text-base py-6">
              <RefreshCw className="mr-2 h-5 w-5" />
              Scan Another
          </Button>
          {user ? (
            <Button onClick={handleSaveSolution} disabled={isSaving || solutionSaved} className="w-full text-base py-6">
              {isSaving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
              {isSaving ? 'Saving...' : solutionSaved ? 'Saved!' : 'Save Solution'}
            </Button>
          ) : (
            <Button asChild className="w-full text-base py-6 animate-pulse-glow">
              <Link href="/login">
                <Download className="mr-2 h-5 w-5" />
                Login to Save
              </Link>
            </Button>
          )}
        </div>
    </div>
);

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [appState, setAppState] = useState<AppState>('welcome');
  const [solution, setSolution] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [formulas, setFormulas] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [identifiedSubject, setIdentifiedSubject] = useState<Subject | null>(null);
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
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [solutionSaved, setSolutionSaved] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
        setShowSplash(false);
    }, 800); // Animation is 0.6s, so 0.8s is a good time to hide it.
    return () => clearTimeout(timer);
  }, []);

  // This effect now ONLY handles cleaning up the camera stream when leaving the scanning screen.
  useEffect(() => {
    const videoElement = videoRef.current;
    if (appState !== 'scanning' && videoElement?.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }, [appState]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Don't wait for signOut to complete. Navigate immediately for a faster user experience.
    setAppState('welcome');
    signOut(auth).catch(error => {
        // Log error but don't block user. The onAuthStateChanged listener is the source of truth.
        console.error("Error signing out: ", error);
        toast({ title: "Logout Failed", description: "There was an error signing out.", variant: "destructive" });
    }).finally(() => {
        setIsLoggingOut(false);
    });
  };

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
    setTopic(null);
    setFormulas(null);
    setError(null);
    setLanguage('en');
    setCrop(undefined);
    setIdentifiedSubject(null);
    setSolutionSaved(false);
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
    // Fill with white background for JPEG compression of transparent areas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
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
      // Use JPEG for lossy, smaller image files. 0.9 provides a good balance of quality and size.
      resolve(canvas.toDataURL('image/jpeg', 0.9));
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
        setTopic(response.topic || null);
        setSolution(response.solution);
        setFormulas(response.formulas || null);
        setIdentifiedSubject(response.identifiedSubject || subject);
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

    const subjectForTranslation = identifiedSubject || subject;

    const response = await getSolution({ 
      photoDataUri: croppedImage, 
      language: newLang, 
      subject: subjectForTranslation
    });
    
    if (response.error) {
      setError(response.error);
      // Keep previous solution steps visible on translation error
    } else if (response.solution) {
      setSolution(response.solution);
      setFormulas(response.formulas || null);
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

  const handleSaveSolution = async () => {
    if (!user) {
        toast({ title: "Login Required", description: "Please log in to save your solutions.", variant: "destructive" });
        return;
    }
    if (!croppedImage || !solution || !topic) {
        toast({ title: "Error", description: "No solution to save.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    try {
        // NEW: Save to a subcollection under the user's ID
        await addDoc(collection(db, 'users', user.uid, 'solutions'), {
            croppedImage,
            topic,
            solution,
            formulas,
            subject,
            identifiedSubject: identifiedSubject || subject,
            language,
            createdAt: serverTimestamp(),
        });
        setSolutionSaved(true);
        toast({
            title: "Success!", 
            description: "Solution saved to your profile.",
            action: (
              <ToastAction
                altText="View Profile"
                onClick={() => router.push('/profile')}
                className="bg-gradient-to-r from-purple-500 to-cyan-400 text-primary-foreground border-transparent hover:opacity-90"
              >
                View Profile
              </ToastAction>
            ),
        });
    } catch (e) {
        console.error("Error saving solution to Firestore: ", e);
        let title = "Save Failed";
        let description = "An unexpected error occurred while saving.";

        if (e instanceof FirestoreError) {
            switch(e.code) {
                case 'permission-denied':
                    description = "Permission denied. Please check your Firestore security rules.";
                    break;
                case 'resource-exhausted':
                case 'invalid-argument': // Firestore uses invalid-argument for too large documents
                    description = 'Image file is too large to save. Please try cropping a smaller area.';
                    break;
                case 'unauthenticated':
                    description = 'You must be logged in to save solutions.';
                    break;
            }
        }
        
        toast({ title, description, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <>
      <SplashScreen isVisible={showSplash} />
      <main className={cn(
        "min-h-screen transition-opacity duration-500",
        showSplash ? "opacity-0" : "opacity-100",
        appState === 'welcome' 
          ? "flex flex-col items-center justify-center p-4" 
          : "container mx-auto max-w-3xl flex flex-col items-center px-0 pb-0"
      )}>
        {appState === 'welcome' && (
          <WelcomeScreen 
            subject={subject} 
            setSubject={setSubject} 
            handleStartScanning={handleStartScanning} 
          />
        )}
        
        {appState !== 'welcome' && (
          <div className={cn(
            "w-full shadow-sm flex flex-1 flex-col mt-4",
            "bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-t-xl"
          )}>
            {(appState !== 'scanning' && appState !== 'cropping') && (
              <header className="w-full max-w-3xl mx-auto py-4 px-4 flex justify-between items-center text-slate-200">
                  <Link href="/" className="font-bold text-xl text-slate-100 flex items-center gap-2" onClick={() => appState !== 'welcome' && setAppState('welcome')}>
                      <Logo className="h-[150px] w-auto aspect-[9/16]" />
                      <span className="hidden sm:inline">AskPix AI</span>
                  </Link>
                  <div>
                      {user ? (
                          <div className="flex items-center gap-2 sm:gap-4">
                              <Button asChild size="sm">
                                  <Link href="/profile">
                                      <User className="h-4 w-4 sm:mr-2" />
                                      <span className="hidden sm:inline">View Profile</span>
                                  </Link>
                              </Button>
                              <Button size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin"/> : <LogOut className="h-4 w-4 sm:mr-2" />}
                                  <span className="hidden sm:inline">Logout</span>
                              </Button>
                          </div>
                      ) : (
                          <Button asChild>
                              <Link href="/login">Login / Sign Up</Link>
                          </Button>
                      )}
                  </div>
              </header>
            )}
            
            {appState === 'scanning' && (
              <ScanningScreen
                hasCameraPermission={hasCameraPermission}
                videoRef={videoRef}
                canvasRef={canvasRef}
                error={error}
                flashSupported={flashSupported}
                isFlashOn={isFlashOn}
                toggleFlash={toggleFlash}
                zoomSupported={zoomSupported}
                handleZoomChange={handleZoomChange}
                handleScan={handleScan}
              />
            )}
            {appState === 'cropping' && (
              <CroppingScreen
                error={error}
                capturedImage={capturedImage}
                crop={crop}
                setCrop={setCrop}
                imgRef={imgRef}
                onImageLoad={onImageLoad}
                handleRetake={handleRetake}
                handleGetSolution={handleGetSolution}
              />
            )}
            {appState === 'solving' && (
              <SolvingScreen
                croppedImage={croppedImage}
              />
            )}
            {appState === 'result' && (
              <ResultScreen
                user={user}
                croppedImage={croppedImage}
                identifiedSubject={identifiedSubject}
                subject={subject}
                error={error}
                language={language}
                isTranslating={isTranslating}
                handleLanguageChange={handleLanguageChange}
                solution={solution}
                topic={topic}
                formulas={formulas}
                handleStartScanning={handleStartScanning}
                handleSaveSolution={handleSaveSolution}
                isSaving={isSaving}
                solutionSaved={solutionSaved}
                router={router}
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}
