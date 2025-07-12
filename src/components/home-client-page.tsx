
'use client';

import { useState, useRef, useEffect, FC, useCallback } from 'react';
import Link from 'next/link';
import { Camera, RefreshCw, ScanLine, XCircle, Bot, Atom, FunctionSquare, TestTube, Dna, Zap, ZoomIn, BrainCircuit, NotebookText, Download, Loader2, LogOut, User, Check, Home, Sparkles, Youtube, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { signOut } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

import { Button, buttonVariants } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


// Define the states for our app's screen flow
type AppState = 'welcome' | 'scanning' | 'cropping' | 'solving' | 'result';

type Subject = 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' | 'General';
type Language = 'en' | 'hi';


interface WelcomeScreenProps {
  subject: Subject;
  setSubject: (subject: Subject) => void;
  handleStartScanning: () => void;
  user: FirebaseUser | null;
  isLoggingOut: boolean;
  handleLogout: () => void;
}
const WelcomeScreen: FC<WelcomeScreenProps> = ({ subject, setSubject, handleStartScanning, user, isLoggingOut, handleLogout }) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col animate-in fade-in-10 min-h-[90vh] sm:min-h-[700px] border border-purple-900/50">
      <header className="flex justify-end items-center w-full mb-4 h-10">
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild size="sm">
                <Link href="/profile">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin"/> : <LogOut className="h-4 w-4" />}
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login / Sign Up</Link>
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col">
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
      </div>

      <div className="flex-shrink-0 pt-4 pb-2">
        <Button onClick={handleStartScanning} size="lg" className="w-full text-lg py-6 animate-pulse-glow">
          <Camera className="mr-3 h-6 w-6" />
          Start Scanning
        </Button>
      </div>
    </div>
  );
}

interface ScanningScreenProps {
  hasCameraPermission: boolean | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  error: string | null;
  flashSupported: boolean;
  isFlashOn: boolean;
  toggleFlash: () => void;
  zoomSupported: boolean;
  handleZoomChange: (value: number[]) => void;
  user: FirebaseUser | null;
  setAppState: (state: AppState) => void;
  handleLogout: () => void;
  isLoggingOut: boolean;
  textQuestion: string;
  setTextQuestion: (text: string) => void;
  handleSolveQuestion: () => void;
}
const ScanningScreen: FC<ScanningScreenProps> = ({ hasCameraPermission, videoRef, error, flashSupported, isFlashOn, toggleFlash, zoomSupported, handleZoomChange, user, setAppState, handleLogout, isLoggingOut, textQuestion, setTextQuestion, handleSolveQuestion }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-0">
      {/* Top Half: Camera */}
      <div className="w-full h-1/2 overflow-hidden relative flex items-center justify-center bg-black">
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

            <div className="absolute top-4 left-4 z-10">
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
      </div>
      
      {/* Top right navigation */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Button onClick={() => setAppState('welcome')} size="icon" className="h-12 w-12 rounded-full">
              <Home />
          </Button>
          {user ? (
              <Button onClick={handleLogout} size="icon" disabled={isLoggingOut} className="h-12 w-12 rounded-full">
                  {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
              </Button>
          ) : (
              <Button asChild size="sm" className="h-12 rounded-full px-4">
                  <Link href="/login">Login / Sign Up</Link>
              </Button>
          )}
      </div>

      {/* Bottom Half: Text Input */}
      <div className="w-full h-1/2 bg-slate-800 p-4 flex flex-col justify-between border-t-2 border-primary">
        <div className="flex-grow flex flex-col">
          <Label htmlFor="text-question" className="text-slate-400 mb-2 block">Or type your question here:</Label>
          <Textarea
            id="text-question"
            value={textQuestion}
            onChange={(e) => setTextQuestion(e.target.value)}
            placeholder="e.g., What is the integral of 2x dx?"
            className="flex-grow bg-slate-900/70 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-primary text-base resize-none"
          />
        </div>
        <Button
          onClick={handleSolveQuestion}
          size="lg"
          className="w-full text-lg py-6 mt-4 flex-shrink-0"
          disabled={hasCameraPermission !== true && !textQuestion.trim()}
        >
          <Sparkles className="mr-3 h-6 w-6" />
          Solve Question
        </Button>
      </div>
    </div>
);

interface CroppingScreenProps {
  capturedImage: string | null;
  crop: Crop | undefined;
  setCrop: (crop: Crop) => void;
  imgRef: React.RefObject<HTMLImageElement>;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  handleRetake: () => void;
  handleGetSolution: () => void;
}
const CroppingScreen: FC<CroppingScreenProps> = ({ capturedImage, crop, setCrop, imgRef, onImageLoad, handleRetake, handleGetSolution }) => (
    <div className="w-full h-full relative bg-black">
        <div className="w-full h-full flex items-center justify-center">
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
                        className="max-w-full max-h-[100dvh] object-contain"
                    />
                </ReactCrop>
            )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div className="flex w-full gap-4">
                <Button onClick={handleRetake} className="w-full text-lg py-6" variant="secondary">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Retake
                </Button>
                <Button onClick={handleGetSolution} className="w-full text-lg py-6" disabled={!crop?.width || !crop?.height}>
                    <Bot className="mr-2 h-5 w-5" />
                    Get Solution
                </Button>
            </div>
        </div>
    </div>
);


interface SolvingScreenProps {
  croppedImage: string | null;
}

const solvingSteps = [
  { text: 'Analyzing content...', icon: <ScanLine className="h-5 w-5 text-slate-400" /> },
  { text: 'Identifying academic subject...', icon: <BrainCircuit className="h-5 w-5 text-slate-400" /> },
  { text: 'Finding relevant videos...', icon: <Youtube className="h-5 w-5 text-slate-400" /> },
  { text: 'Formulating step-by-step solution...', icon: <Bot className="h-5 w-5 text-slate-400" /> },
  { text: 'Formatting final answer...', icon: <NotebookText className="h-5 w-5 text-slate-400" /> },
];

const SolvingScreen: FC<SolvingScreenProps> = ({ croppedImage }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = solvingSteps.map((_, index) =>
      setTimeout(() => {
        setActiveStep(index + 1);
      }, (index + 1) * 1200)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-500 p-4 text-slate-200">
      {croppedImage && (
        <div className="w-full aspect-video bg-black/20 border-slate-700/50 border rounded-lg overflow-hidden relative flex items-center justify-center">
          <Image src={croppedImage} alt="Cropped question" fill className="object-contain" />
        </div>
      )}

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
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent"></div>
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
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent"></div>
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
  youtubeVideoId: string | null;
  youtubeVideoThumbnail: string | null;
  handleStartScanning: () => void;
  handleSaveSolution: () => void;
  isSaving: boolean;
  solutionSaved: boolean;
  router: AppRouterInstance;
}
const ResultScreen: FC<ResultScreenProps> = ({ user, croppedImage, identifiedSubject, subject, error, language, isTranslating, handleLanguageChange, solution, topic, formulas, youtubeVideoId, youtubeVideoThumbnail, handleStartScanning, handleSaveSolution, isSaving, solutionSaved, router }) => {

    const openVideo = async () => {
        if (!youtubeVideoId) return;
        const url = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
        
        if (Capacitor.isNativePlatform()) {
            await Browser.open({ url });
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-500 p-4 text-slate-200">
        {croppedImage && (
            <div className="w-full aspect-video bg-black/20 border-slate-700/50 border rounded-lg overflow-hidden relative flex items-center justify-center">
                <Image src={croppedImage} alt="Cropped question" fill className="object-contain" />
            </div>
        )}
        
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
                    {youtubeVideoId && youtubeVideoThumbnail && (
                      <Card className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 border-purple-900/50">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-slate-100">
                                  <Youtube />
                                  Related Video Lesson
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                              <div
                                onClick={openVideo}
                                className="aspect-video w-full rounded-md overflow-hidden relative group cursor-pointer"
                              >
                                <Image 
                                    src={youtubeVideoThumbnail} 
                                    alt="Video thumbnail"
                                    layout="fill"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <PlayCircle className="h-16 w-16 text-white/80 group-hover:text-white drop-shadow-lg" />
                                </div>
                              </div>
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
            <Button asChild className="w-full text-base py-6 animate-pulse-glow" onClick={() => {
                if (solution && topic) {
                    const pendingSolution = {
                        croppedImage: croppedImage, // Can be null for text questions
                        solution,
                        topic,
                        formulas,
                        youtubeVideoId,
                        youtubeVideoThumbnail,
                        subject,
                        identifiedSubject: identifiedSubject || subject,
                        language,
                    };
                    localStorage.setItem('pendingSolution', JSON.stringify(pendingSolution));
                }
            }}>
              <Link href="/login">
                <Download className="mr-2 h-5 w-5" />
                Login to Save
              </Link>
            </Button>
          )}
        </div>
    </div>
);
}

export default function HomeClientPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [appState, setAppState] = useState<AppState>('welcome');
  const [solution, setSolution] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [formulas, setFormulas] = useState<string | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [youtubeVideoThumbnail, setYoutubeVideoThumbnail] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [identifiedSubject, setIdentifiedSubject] = useState<Subject | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [textQuestion, setTextQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [flashSupported, setFlashSupported] = useState(false);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [solutionSaved, setSolutionSaved] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
        setShowSplash(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const pendingSolutionJSON = localStorage.getItem('pendingSolution');
    if (pendingSolutionJSON && user) {
        try {
            const pendingSolution = JSON.parse(pendingSolutionJSON);
            if (pendingSolution.solution && pendingSolution.topic) {
                setCroppedImage(pendingSolution.croppedImage || null);
                setSolution(pendingSolution.solution);
                setTopic(pendingSolution.topic);
                setFormulas(pendingSolution.formulas || null);
                setYoutubeVideoId(pendingSolution.youtubeVideoId || null);
                setYoutubeVideoThumbnail(pendingSolution.youtubeVideoThumbnail || null);
                setSubject(pendingSolution.subject || 'General');
                setIdentifiedSubject(pendingSolution.identifiedSubject || null);
                setLanguage(pendingSolution.language || 'en');
                setAppState('result');
            }
        } catch (e) {
            console.error("Failed to parse pending solution", e);
        } finally {
            localStorage.removeItem('pendingSolution');
        }
    }
  }, [user]); 

  useEffect(() => {
    const videoElement = videoRef.current;
    if (appState !== 'scanning' && videoElement?.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }, [appState]);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    signOut(auth).catch(error => {
        console.error("Error signing out: ", error);
        toast({ title: "Logout Failed", description: "There was an error signing out.", variant: "destructive" });
    }).finally(() => {
        setIsLoggingOut(false);
        setAppState('welcome');
    });
  }, [toast]);

  const startCamera = useCallback(async () => {
    setAppState('scanning');
    setHasCameraPermission(null);
    setError(null);
    setFlashSupported(false);
    setZoomSupported(false);
    setIsFlashOn(false);

    if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported by your browser.");
        setHasCameraPermission(false);
        return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } });
      const video = videoRef.current;
      if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
              setHasCameraPermission(true);
              const [track] = stream!.getVideoTracks();
              const capabilities = track.getCapabilities();
              if (capabilities.torch) setFlashSupported(true);
              if (capabilities.zoom) setZoomSupported(true);
          };
      }
    } catch (err) {
      setHasCameraPermission(false);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          setError('Camera access was denied. Please enable camera permissions in your browser settings.');
      } else {
          setError('Could not access the camera. It may be in use, not available, or not supported.');
      }
    }
  }, []);

  const resetStateForNewScan = () => {
    setCapturedImage(null);
    setCroppedImage(null);
    setSolution(null);
    setTopic(null);
    setFormulas(null);
    setYoutubeVideoId(null);
    setYoutubeVideoThumbnail(null);
    setError(null);
    setLanguage('en');
    setCrop(undefined);
    setIdentifiedSubject(null);
    setSolutionSaved(false);
    setTextQuestion('');
  };

  const handleStartScanning = useCallback(async () => {
    resetStateForNewScan();
    await startCamera();
  }, [startCamera]);

  const handleRetake = useCallback(async () => {
    await handleStartScanning();
  }, [handleStartScanning]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = App.addListener('backButton', () => {
        switch (appState) {
            case 'result': setAppState('welcome'); break;
            case 'solving': setAppState('cropping'); break;
            case 'cropping': handleRetake(); break;
            case 'scanning': setAppState('welcome'); break;
            case 'welcome': App.exitApp(); break;
            default: App.exitApp();
        }
    });
    return () => { listener.remove(); };
  }, [appState, handleRetake]);

  function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.reject(new Error('Failed to get canvas context'));
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);
    return Promise.resolve(canvas.toDataURL('image/jpeg', 0.9));
  }

  const handleApiResponse = (result: any) => {
    if (result.error) throw new Error(result.error);
    
    setTopic(result.topic || null);
    setSolution(result.solution || null);
    setFormulas(result.formulas || null);
    setYoutubeVideoId(result.youtubeVideoId || null);
    setYoutubeVideoThumbnail(result.youtubeVideoThumbnail || null);
    setIdentifiedSubject(result.identifiedSubject || subject);
    
    if (!result?.solution || !result?.topic || !result.identifiedSubject) {
      setError('Could not generate a solution. Please try again.');
    }
    setAppState('result');
  };

  const handleApiError = (e: any) => {
    console.error("Solution retrieval failed", e);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    let errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    if (Capacitor.isNativePlatform() && !apiBaseUrl) {
        errorMessage = "The app is not configured with a server URL. Please ensure the VERCEL_URL secret is set in your GitHub repository and rebuild the app.";
    }
    setError(errorMessage);
    setAppState('result');
  };
  
  const callApi = async (endpoint: string, payload: object) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    // For mobile builds, NEXT_PUBLIC_API_BASE_URL is required.
    // For web, we can use a relative path.
    if (Capacitor.isNativePlatform() && !apiBaseUrl) {
      throw new Error("The app is not configured with a server URL. Please set the VERCEL_URL secret in your GitHub repository and rebuild the app.");
    }
    const fullUrl = Capacitor.isNativePlatform() ? `${apiBaseUrl}${endpoint}` : endpoint;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `API request failed with status ${response.status}` }));
      throw new Error(errorData.error || `API Error`);
    }
    return response.json();
  };

  const handleGetSolutionFromImage = async () => {
    if (!crop || !imgRef.current || !crop.width || !crop.height) {
      setError("Please select an area to crop before getting a solution.");
      return;
    }
    setAppState('solving');
    setError(null);
    try {
      const croppedDataUri = await getCroppedImg(imgRef.current, crop);
      setCroppedImage(croppedDataUri);
      
      const payload = { photoDataUri: croppedDataUri, language, subject };
      const result = await callApi('/api/solve', payload);
      handleApiResponse(result);
    } catch (e) {
      handleApiError(e);
    }
  };

  const handleGetSolutionFromText = async () => {
    setAppState('solving');
    setError(null);
    setCroppedImage(null);
    try {
      const payload = { questionText: textQuestion, language, subject };
      const result = await callApi('/api/solve-text', payload);
      handleApiResponse(result);
    } catch (e) {
      handleApiError(e);
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (!solution) {
      setError("Cannot change language without a solved question.");
      return;
    }
    
    setIsTranslating(true);
    setError(null);
    setLanguage(newLang);

    const subjectForTranslation = identifiedSubject || subject;
    
    try {
      let result;
      if (croppedImage) {
          const payload = { photoDataUri: croppedImage, language: newLang, subject: subjectForTranslation };
          result = await callApi('/api/solve', payload);
      } else {
          const payload = { questionText: textQuestion, language: newLang, subject: subjectForTranslation };
          result = await callApi('/api/solve-text', payload);
      }

      if (result.error) throw new Error(result.error);
      if (!result?.solution) throw new Error('Failed to translate the solution.');

      setSolution(result.solution);
      setFormulas(result.formulas || null);
      setYoutubeVideoId(result.youtubeVideoId || null);
      setYoutubeVideoThumbnail(result.youtubeVideoThumbnail || null);

    } catch (e) {
      console.error("Translation failed", e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred during translation.');
    } finally {
      setIsTranslating(false);
    }
  };


  const handleCameraCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/png');
        setCapturedImage(dataUri);
        setAppState('cropping');
      }
    }
  };

  const handleSolveQuestion = () => {
    if (textQuestion.trim()) {
      handleGetSolutionFromText();
    } else {
      handleCameraCapture();
    }
  };

  const toggleFlash = async () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const [track] = stream.getVideoTracks();
      if (track) { await track.applyConstraints({ advanced: [{ torch: !isFlashOn }] }); setIsFlashOn(!isFlashOn); }
    }
  };

  const handleZoomChange = async (value: number[]) => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities();
      if (capabilities.zoom) {
        const minZoom = capabilities.zoom.min!;
        const maxZoom = capabilities.zoom.max!;
        const newZoom = minZoom + (maxZoom - minZoom) * ((value[0] - 1) / 9);
        await track.applyConstraints({ advanced: [{ zoom: newZoom }] });
      }
    }
  };
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: 'px', width: width * 0.9 }, 16 / 9, width, height), width, height));
  }

  const handleSaveSolution = async () => {
    if (!user) { toast({ title: "Login Required", description: "Please log in to save your solutions.", variant: "destructive" }); return; }
    if (!solution || !topic) { toast({ title: "Error", description: "No solution to save.", variant: "destructive" }); return; }
    if (!db) { toast({ title: "Save Failed", description: "Could not connect to the database.", variant: "destructive" }); return; }

    setIsSaving(true);
    try {
        await addDoc(collection(db, 'users', user.uid, 'solutions'), {
            croppedImage, // This will be null for text questions, which is fine
            topic,
            solution,
            formulas,
            youtubeVideoId,
            youtubeVideoThumbnail,
            subject,
            identifiedSubject: identifiedSubject || subject,
            language,
            createdAt: serverTimestamp(),
        });
        setSolutionSaved(true);
        toast({
            title: "Success!", 
            description: "Solution saved to your profile.",
            action: <ToastAction altText="View Profile" onClick={() => router.push('/profile')}>View Profile</ToastAction>,
        });
    } catch (e) {
        console.error("Error saving solution: ", e);
        let description = "An unexpected error occurred.";
        if (e instanceof FirestoreError) {
            if (e.code === 'permission-denied') description = "Permission denied.";
            else if (e.code === 'resource-exhausted' || e.code === 'invalid-argument') description = 'Image file is too large to save.';
        }
        toast({ title: "Save Failed", description, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <>
      <SplashScreen isVisible={showSplash} />
      <main className={cn(
        "min-h-screen transition-opacity duration-100",
        showSplash ? "opacity-0" : "opacity-100",
        "flex flex-col",
        appState === 'welcome' 
          ? "items-center justify-center p-4" 
          : "container mx-auto max-w-3xl items-center px-0 h-screen"
      )}>
        {appState === 'welcome' && (
          <WelcomeScreen 
            subject={subject} 
            setSubject={setSubject} 
            handleStartScanning={handleStartScanning} 
            user={user}
            isLoggingOut={isLoggingOut}
            handleLogout={handleLogout}
          />
        )}
        
        {appState !== 'welcome' && (
          <div className={cn(
            "w-full shadow-sm flex flex-1 flex-col h-full",
            "bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-t-xl"
          )}>
            {appState !== 'scanning' && appState !== 'cropping' && (
              <header className="w-full max-w-3xl mx-auto py-4 px-4 flex justify-between items-center text-slate-200">
                  <h1 className="font-bold text-xl text-slate-100 flex items-center gap-2">AskPix AI</h1>
                  <div className="flex items-center gap-2 sm:gap-4">
                      <Button onClick={() => setAppState('welcome')} size="icon">
                        <Home />
                      </Button>
                      {user ? (
                          <>
                              <Button asChild size="icon">
                                  <Link href="/profile">
                                      <User />
                                  </Link>
                              </Button>
                              <Button size="icon" onClick={handleLogout} disabled={isLoggingOut}>
                                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin"/> : <LogOut />}
                              </Button>
                          </>
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
                error={error}
                flashSupported={flashSupported}
                isFlashOn={isFlashOn}
                toggleFlash={toggleFlash}
                zoomSupported={zoomSupported}
                handleZoomChange={handleZoomChange}
                user={user}
                setAppState={setAppState}
                handleLogout={handleLogout}
                isLoggingOut={isLoggingOut}
                textQuestion={textQuestion}
                setTextQuestion={setTextQuestion}
                handleSolveQuestion={handleSolveQuestion}
              />
            )}
            {appState === 'cropping' && (
              <CroppingScreen
                capturedImage={capturedImage}
                crop={crop}
                setCrop={setCrop}
                imgRef={imgRef}
                onImageLoad={onImageLoad}
                handleRetake={handleRetake}
                handleGetSolution={handleGetSolutionFromImage}
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
                youtubeVideoId={youtubeVideoId}
                youtubeVideoThumbnail={youtubeVideoThumbnail}
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
