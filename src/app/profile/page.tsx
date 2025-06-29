'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, LogOut, User, Loader2, Home, FileWarning } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState, useCallback } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { collection, query, onSnapshot, Timestamp, orderBy, FirestoreError } from "firebase/firestore";
import jsPDF from 'jspdf';
import { Logo } from "@/components/icons/logo";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SavedSolution {
    id: string;
    croppedImage: string;
    topic: string;
    solution: string;
    formulas?: string | null;
    subject: string;
    identifiedSubject: string;
    language: string;
    createdAt: Timestamp;
}

const cleanupTextForPdf = (text: string | null | undefined): string => {
  if (!text) return '';

  // Remove LaTeX delimiters and markdown bold markers
  let processedText = text.replace(/\$|(\*\*)/g, '');

  // Convert single-digit superscripts (e.g., a^2) to Unicode
  processedText = processedText.replace(/\^(\d)/g, (_, digit) => {
    const superscripts: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return superscripts[digit] || `^${digit}`;
  });

  // Convert bracketed superscripts (e.g., a^{10}) to Unicode
  processedText = processedText.replace(/\^\{([^}]+)\}/g, (_, content) => {
    const superscripts: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '+': '⁺', '-': '⁻'
    };
    return Array.from(content as string).map((char: string) => superscripts[char] || char).join('');
  });
  
  return processedText;
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [solutions, setSolutions] = useState<SavedSolution[]>([]);
    const [loading, setLoading] = useState(true);
    const [solutionsLoading, setSolutionsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
            toast({ title: "Logout Failed", description: "There was an error signing out.", variant: "destructive" });
        }
    }, [router, toast]);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);

                const solutionsColl = collection(db, "users", currentUser.uid, "solutions");
                const q = query(solutionsColl, orderBy("createdAt", "desc"));
                
                const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    const fetchedSolutions = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as SavedSolution[];
                    
                    setSolutions(fetchedSolutions);
                    setSolutionsLoading(false);
                    setError(null);
                }, (e: FirestoreError) => {
                     console.error("Error fetching solutions: ", e);
                     let description = "An error occurred while fetching your solutions.";
                     if (e.code === 'permission-denied') {
                         description = "Permission denied. Please check your Firestore security rules to allow access.";
                     }
                     setError(description);
                     setSolutionsLoading(false);
                });
                
                return () => unsubscribeSnapshot();
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [router]);

    const handleDownload = async (solution: SavedSolution) => {
        if (solution.language === 'hi') {
            const htmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solution: ${solution.topic}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0KOVZs3OFDGU4awxMmuAyBCPRbNEOTNaEftGWhUbGasKceMn/bVCTX" crossorigin="anonymous">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"
        onload="renderMathInElement(document.body, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}] });">
    </script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; line-height: 1.6; background-color: #22272e; color: #cdd9e5; padding: 1rem; max-width: 800px; margin: auto; }
        .container { background-color: #2d333b; border-radius: 8px; padding: 1rem 2rem 2rem 2rem; }
        img { max-width: 100%; height: auto; display: block; margin: 1.5rem 0; border-radius: 6px; }
        h1, h2 { color: #f0f6fc; border-bottom: 1px solid #484f58; padding-bottom: 0.5rem; }
        h1 { font-size: 1.75rem; }
        h2 { font-size: 1.5rem; }
        .content-block { margin-top: 1.5rem; }
        .text-content { white-space: pre-wrap; word-wrap: break-word; font-size: 1rem; }
        .katex-display { padding: 1em 0; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Question</h1>
        <img src="${solution.croppedImage}" alt="Question Image">
        
        <h2>Topic: ${solution.topic}</h2>
        
        <div class="content-block">
            <h2>Solution</h2>
            <div class="text-content">${solution.solution}</div>
        </div>
        
        ${solution.formulas ? `
        <div class="content-block">
            <h2>Key Formulas</h2>
            <div class="text-content">${solution.formulas}</div>
        </div>
        ` : ''}
    </div>
</body>
</html>`;

            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", `solution-${solution.id}.html`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            return;
        }

        // Existing PDF logic for English solutions
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const margin = 15;
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 15;

        try {
            const response = await fetch('/logo.png');
            const blob = await response.blob();
            const reader = new FileReader();
            const logoDataUrl = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
            
            const logoImg = new window.Image();
            logoImg.src = logoDataUrl;
            await new Promise(resolve => { logoImg.onload = resolve; });

            const logoWidth = 60;
            const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
            const logoHeight = logoWidth / aspectRatio;
            const logoX = (doc.internal.pageSize.getWidth() - logoWidth) / 2;
            
            doc.setFillColor(23, 23, 31);
            doc.rect(logoX - 5, yPos - 5, logoWidth + 10, logoHeight + 10, 'F');

            doc.addImage(logoDataUrl, 'PNG', logoX, yPos, logoWidth, logoHeight);
            yPos += logoHeight + 10;
        } catch (e) {
            console.error("Could not load logo for PDF", e);
        }
        
        doc.setFontSize(10).text("Build By Harsh Pathak", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 10;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, doc.internal.pageSize.getWidth() - margin, yPos);
        yPos += 15;

        doc.setFontSize(16).text("Question:", margin, yPos);
        yPos += 10;
        
        try {
            const imgData = solution.croppedImage;
            const img = new window.Image();
            img.src = imgData;
            await new Promise(resolve => {
                img.onload = resolve;
                img.onerror = () => resolve(null);
            });
            
            const imgWidth = doc.internal.pageSize.getWidth() - (margin * 2);
            const imgHeight = (img.height * imgWidth) / img.width;

            if (yPos + imgHeight > pageHeight - margin) {
                doc.addPage();
                yPos = 20;
            }
            doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 15;

        } catch (e) {
            console.error("Error adding image to PDF", e);
            doc.text("Could not load question image.", margin, yPos);
            yPos += 10;
        }

        const checkPageBreak = () => {
          if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = 20;
          }
        };

        checkPageBreak();

        doc.setFontSize(16).text("Solution:", margin, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        const sanitizedSolution = cleanupTextForPdf(solution.solution);
        const solutionLines = doc.splitTextToSize(sanitizedSolution, doc.internal.pageSize.getWidth() - (margin * 2));
        
        for (const line of solutionLines) {
            checkPageBreak();
            doc.text(line, margin, yPos);
            yPos += 7;
        }
        
        yPos += 10;

        if (solution.formulas) {
            checkPageBreak();
            doc.setFontSize(16).text("Key Formulas:", margin, yPos);
            yPos += 10;

            doc.setFontSize(12);
            const sanitizedFormulas = cleanupTextForPdf(solution.formulas);
            const formulaLines = doc.splitTextToSize(sanitizedFormulas, doc.internal.pageSize.getWidth() - (margin * 2));
            for (const line of formulaLines) {
                checkPageBreak();
                doc.text(line, margin, yPos);
                yPos += 7;
            }
        }

        doc.save(`solution-${solution.id}.pdf`);
    };
    
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        )
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <Link href="/" className="font-bold text-xl text-slate-100 flex items-center gap-2">
                <Logo className="h-8 w-8" />
            </Link>
            <div className="flex items-center gap-4">
                <Button onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
        </header>
        
        <div className="flex items-center gap-6 mb-8">
            <Avatar className="w-20 h-20 text-lg border-2 border-primary/50">
                <AvatarFallback>
                    <User className="w-10 h-10" />
                </AvatarFallback>
            </Avatar>

            <div>
                <h1 className="text-3xl font-bold text-slate-100">{user?.displayName || "My Profile"}</h1>
                <p className="text-slate-400 mt-1">{user?.email}</p>
            </div>
        </div>

        <Card className="bg-slate-800/30 border-purple-900/50 text-slate-200 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-slate-100">Saved Solutions</CardTitle>
                <CardDescription className="text-slate-400">
                    Download your previously solved questions as PDF or HTML.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {solutionsLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : error ? (
                     <Alert variant="destructive" className="bg-gradient-to-br from-rose-500 to-red-900 border-rose-400 text-white">
                        <FileWarning className="h-4 w-4" />
                        <AlertTitle>Could not load solutions</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <ul className="space-y-4">
                        {solutions.map((file) => (
                            <li key={file.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors gap-4">
                            <div className="flex items-center gap-4">
                                <Image
                                    src={file.croppedImage}
                                    alt="Question thumbnail"
                                    width={80}
                                    height={45}
                                    className="rounded-md object-cover aspect-video bg-slate-700"
                                />
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-100">{file.topic}</p>
                                    <p className="text-sm text-slate-400">{file.identifiedSubject} &middot; Saved on {file.createdAt.toDate().toLocaleDateString()}</p>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleDownload(file)} className="self-end sm:self-center">
                                    <Download className="mr-2 h-4 w-4"/>
                                    Download
                            </Button>
                            </li>
                        ))}
                    </ul>
                )}
                {(!solutionsLoading && !error && solutions.length === 0) && (
                    <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-4">
                        <p>You have no saved solutions yet.</p>
                        <Button asChild><Link href="/"><Home className="mr-2 h-4 w-4" /> Solve a question to get started!</Link></Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
    );
}
