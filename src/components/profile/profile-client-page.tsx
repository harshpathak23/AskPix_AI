
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
import { Logo } from "@/components/icons/logo";
import { useToast } from "@/hooks/use-toast";
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
    const { toast } = useToast();

    const handleLogout = useCallback(() => {
        setIsLoggingOut(true);
        // Navigate immediately for a faster experience. The auth listener will handle the state.
        router.push('/login');
        signOut(auth).catch(error => {
            console.error("Error signing out: ", error);
            toast({ title: "Logout Failed", description: "There was an error signing out.", variant: "destructive" });
        }).finally(() => {
            setIsLoggingOut(false);
        });
    }, [router, toast]);

    useEffect(() => {
        // If auth is done loading and there's no user, redirect.
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        // If we have a user, fetch their solutions.
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
            
            // Cleanup function for the snapshot listener
            return () => unsubscribeSnapshot();
        }
    }, [user, loading, router]);


    const handleDeleteSolution = async () => {
        if (!solutionToDelete || !user) return;
        
        if (!db) {
            toast({
                title: "Deletion Failed",
                description: "Could not connect to the database.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, "users", user.uid, "solutions", solutionToDelete.id));
            toast({
                title: "Solution Deleted",
                description: `"${solutionToDelete.topic}" has been removed.`,
            });
            setSolutionToDelete(null); // Close the dialog on success
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
        const htmlContent = `<!DOCTYPE html>
<html lang="${solution.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solution: ${solution.topic}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0KOVZs3OFDGU4awxMmuAyBCPRbNEOTNaEftGWhUbGasKceMn/bVCTX" crossorigin="anonymous">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"
        onload="renderMathInElement(document.body, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}] }); setTimeout(function(){ window.print(); }, 500);">
    </script>
    <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0.5in; }
        }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; line-height: 1.6; background-color: #f9f9f9; color: #111; padding: 1rem; max-width: 800px; margin: auto; }
        .container { background-color: #fff; border-radius: 8px; padding: 1rem 2rem 2rem 2rem; border: 1px solid #ddd; }
        img { max-width: 100%; height: auto; display: block; margin: 1.5rem 0; border-radius: 6px; }
        h1, h2 { color: #000; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
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
            <h2>Solution (${solution.language === 'hi' ? 'Hindi' : 'English'})</h2>
            <div class="text-content">${solution.solution.replace(/\n/g, '<br/>')}</div>
        </div>
        
        ${solution.formulas ? `
        <div class="content-block">
            <h2>Key Formulas</h2>
            <div class="text-content">${solution.formulas.replace(/\n/g, '<br/>')}</div>
        </div>
        ` : ''}
    </div>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        } else {
            toast({
                title: "Download Failed",
                description: "Could not open a new window. Please disable your pop-up blocker for this site.",
                variant: "destructive",
            });
        }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <Link href="/" className="font-bold text-xl text-slate-100 flex items-center gap-2">
                <Logo className="h-[150px] w-auto aspect-[9/16]" />
            </Link>
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
                                    <Button size="sm" onClick={() => handleDownload(file)}>
                                        <Download className="mr-2 h-4 w-4"/>
                                        Download
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
