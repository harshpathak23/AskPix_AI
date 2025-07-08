
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, LogOut, Loader2, Home, FileWarning, Trash2 } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState, useCallback } from "react";
import { collection, query, onSnapshot, Timestamp, orderBy, FirestoreError, doc, deleteDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProfileIcon } from "@/components/icons/profile-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";

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

export default function ProfileClientPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [solutions, setSolutions] = useState<SavedSolution[]>([]);
    const [solutionsLoading, setSolutionsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [solutionToDelete, setSolutionToDelete] = useState<SavedSolution | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleLogout = useCallback(() => {
        setIsLoggingOut(true);
        router.push('/login');
        signOut(auth).catch(error => {
            console.error("Error signing out: ", error);
            toast({ title: "Logout Failed", description: "There was an error signing out.", variant: "destructive" });
        }).finally(() => {
            setIsLoggingOut(false);
        });
    }, [router]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            if (!db) {
                setError("Firebase is not configured correctly. Saved solutions cannot be loaded.");
                setSolutionsLoading(false);
                return;
            }

            const solutionsColl = collection(db, "users", user.uid, "solutions");
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
        }
    }, [user, loading, router]);


    const handleDeleteSolution = async () => {
        if (!solutionToDelete || !user || !db) return;
        
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, "users", user.uid, "solutions", solutionToDelete.id));
            toast({
                title: "Solution Deleted",
                description: `"${solutionToDelete.topic}" has been removed.`,
            });
            setSolutionToDelete(null);
        } catch (e) {
            console.error("Error deleting solution: ", e);
            toast({
                title: "Deletion Failed",
                description: "Could not delete the solution. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownload = async (solution: SavedSolution) => {
        setDownloadingId(solution.id);
        toast({ title: 'Preparing File...', description: 'Please wait a moment.' });

        // Check if the Web Share API is supported, which is the best method for mobile.
        if (!navigator.share) {
            toast({ title: 'Error', description: 'File sharing is not supported on your device.', variant: 'destructive' });
            setDownloadingId(null);
            return;
        }

        const fileNameBase = solution.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        try {
            let blob: Blob;
            let fileName: string;
            
            if (solution.language === 'hi') {
                const htmlString = `
                    <!DOCTYPE html>
                    <html lang="hi"><head><meta charset="UTF-8"><title>Solution: ${solution.topic}</title></head>
                    <body><h1>Question</h1><img src="${solution.croppedImage}" alt="Question Image" style="max-width:100%;"><h2>Topic: ${solution.topic}</h2><div><h2>Solution (Hindi)</h2>${solution.solution.replace(/\n/g, '<br/>')}</div></body></html>`;
                blob = new Blob([htmlString], { type: 'text/html' });
                fileName = `${fileNameBase || 'solution'}.html`;
            } else {
                 // Dynamically import libraries ONLY when needed
                const { default: jsPDF } = await import('jspdf');
                const { default: html2canvas } = await import('html2canvas');
                const htmlString = `
                    <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Solution: ${solution.topic}</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"><script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script><script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body);"><\/script><style>body{font-family:sans-serif;line-height:1.6;padding:20px;max-width:800px;margin:auto;color:#333;}.container{border:1px solid #ddd;padding:2rem;background:#fff;}img{max-width:100%;}h1,h2{border-bottom:1px solid #eee;}.solution-text{white-space:pre-wrap;}</style></head>
                    <body><div class="container"><h1>Question</h1><img src="${solution.croppedImage}" alt="Question Image"><h2>Topic: ${solution.topic}</h2><div class="solution-text"><h2>Solution</h2>${solution.solution.replace(/\n/g, '<br/>')}</div>${solution.formulas ? `<div><h2>Formulas</h2><div class="solution-text">${solution.formulas.replace(/\n/g, '<br/>')}</div></div>` : ''}</div></body></html>`;
                
                const element = document.createElement('div');
                element.style.position = 'absolute';
                element.style.left = '-9999px';
                element.style.width = '800px';
                element.innerHTML = htmlString;
                document.body.appendChild(element);

                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const canvas = await html2canvas(element.querySelector('.container') as HTMLElement, { scale: 2, useCORS: true });
                document.body.removeChild(element);

                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const imgHeight = (canvas.height * pdfWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
                while (heightLeft > 0) {
                    position = position - pdf.internal.pageSize.getHeight();
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdf.internal.pageSize.getHeight();
                }
                blob = pdf.output('blob');
                fileName = `${fileNameBase || 'solution'}.pdf`;
            }

            // Use the Web Share API
            const file = new File([blob], fileName, { type: blob.type });
            await navigator.share({
                title: solution.topic,
                text: `Solution for ${solution.topic}`,
                files: [file],
            });
            toast({ title: 'Success!', description: 'Share dialog opened.' });

        } catch (error: any) {
            console.error('Download/Share failed', error);
            // Don't show an error if the user just closed the share sheet
            if (error.name !== 'AbortError') {
                 toast({ title: 'Error', description: error.message || 'Could not share the file.', variant: 'destructive' });
            }
        } finally {
            setDownloadingId(null);
        }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="font-bold text-xl text-slate-100">AskPix AI</h1>
            <div className="flex items-center gap-2 sm:gap-4">
                <Button asChild size="icon">
                    <Link href="/">
                        <Home />
                    </Link>
                </Button>
                <Button onClick={handleLogout} size="icon" disabled={isLoggingOut}>
                    {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
                </Button>
            </div>
        </header>
        
        <div className="flex items-center gap-6 mb-8">
            {loading ? (
                <>
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                </>
            ) : (
                <>
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/50">
                        <ProfileIcon />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">{user?.displayName || "My Profile"}</h1>
                        <p className="text-slate-400 mt-1">{user?.email}</p>
                    </div>
                </>
            )}
        </div>

        <Card className="bg-slate-800/30 border-purple-900/50 text-slate-200 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-slate-100">Saved Solutions</CardTitle>
                <CardDescription className="text-slate-400">
                    Download or delete your previously solved questions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {solutionsLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
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
                            <li key={file.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-lg bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border border-purple-900/50 hover:brightness-110 transition-all gap-4">
                                <div className="flex items-center gap-4 flex-grow">
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
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <Button size="sm" onClick={() => handleDownload(file)} disabled={downloadingId === file.id}>
                                        {downloadingId === file.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                        {downloadingId === file.id ? 'Preparing...' : 'Share'}
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => setSolutionToDelete(file)} disabled={isDeleting}>
                                        <Trash2 className="mr-2 h-4 w-4"/>
                                        Delete
                                    </Button>
                                </div>
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

       <AlertDialog open={!!solutionToDelete} onOpenChange={(open) => !open && setSolutionToDelete(null)}>
            <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-purple-900/50 text-slate-200">
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                    This action cannot be undone. This will permanently delete the solution for "{solutionToDelete?.topic}" from your account.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel
                    onClick={() => setSolutionToDelete(null)}
                    className="bg-gradient-to-r from-purple-600 to-cyan-400 text-primary-foreground hover:opacity-90 border-transparent"
                >
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleDeleteSolution}
                    disabled={isDeleting}
                    className="bg-gradient-to-br from-rose-500 to-red-900 border-rose-400 text-white"
                >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Delete Solution
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
    );
}

    