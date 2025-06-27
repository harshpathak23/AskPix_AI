'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, LogOut, User, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import jsPDF from 'jspdf';


interface SavedSolution {
    id: string;
    croppedImage: string;
    solution: string;
    formulas?: string | null;
    subject: string;
    identifiedSubject: string;
    language: string;
    userId: string;
    createdAt: Timestamp;
}


export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [solutions, setSolutions] = useState<SavedSolution[]>([]);
    const [loading, setLoading] = useState(true);
    const [solutionsLoading, setSolutionsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                try {
                    setSolutionsLoading(true);
                    const q = query(collection(db, "solutions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
                    const querySnapshot = await getDocs(q);
                    const fetchedSolutions = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as SavedSolution[];
                    setSolutions(fetchedSolutions);
                } catch (error) {
                    console.error("Error fetching solutions: ", error);
                } finally {
                    setSolutionsLoading(false);
                }
            } else {
                router.push('/login');
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [router]);


    const handleDownload = async (solution: SavedSolution) => {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const margin = 15;
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;
    
        doc.setFontSize(22).text("ScanSolve AI Solution", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 20;
    
        doc.setFontSize(16).text("Question:", margin, yPos);
        yPos += 10;
        
        try {
            const imgData = solution.croppedImage;
            const img = new Image();
            img.src = imgData;
            await new Promise(resolve => {
                img.onload = resolve;
                img.onerror = () => resolve(null); // Resolve on error too
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
    
        // Ensure yPos is on the current page before adding more content
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
        const sanitizedSolution = solution.solution.replace(/\$\$|(?<!\$)\$|\$(?!\$)/g, '');
        const solutionLines = doc.splitTextToSize(sanitizedSolution, doc.internal.pageSize.getWidth() - (margin * 2));
        
        for (const line of solutionLines) {
            checkPageBreak();
            doc.text(line, margin, yPos);
            yPos += 7; // line height
        }
        
        yPos += 10;
    
        if (solution.formulas) {
            checkPageBreak();
            doc.setFontSize(16).text("Key Formulas:", margin, yPos);
            yPos += 10;
    
            doc.setFontSize(12);
            const sanitizedFormulas = solution.formulas.replace(/\$\$|(?<!\$)\$|\$(?!\$)/g, '');
            const formulaLines = doc.splitTextToSize(sanitizedFormulas, doc.internal.pageSize.getWidth() - (margin * 2));
            for (const line of formulaLines) {
                checkPageBreak();
                doc.text(line, margin, yPos);
                yPos += 7;
            }
        }
    
        doc.save(`solution-${solution.id}.pdf`);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
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
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                    <User className="w-8 h-8"/>
                    My Profile
                </h1>
                <p className="text-slate-400 mt-1 ml-1">{user?.email}</p>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
        </header>

        <Card className="bg-slate-800/30 border-purple-900/50 text-slate-200 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-slate-100">Saved Solutions</CardTitle>
                <CardDescription className="text-slate-400">
                    Download your previously solved questions as PDF.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {solutionsLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {solutions.map((file) => (
                            <li key={file.id} className="flex justify-between items-center p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors">
                               <div className="flex items-center gap-4">
                                 <FileText className="w-6 h-6 text-primary"/>
                                 <div>
                                    <p className="font-semibold text-slate-100">{file.identifiedSubject} Question</p>
                                    <p className="text-sm text-slate-400">Saved on {file.createdAt.toDate().toLocaleDateString()}</p>
                                 </div>
                               </div>
                               <Button size="sm" onClick={() => handleDownload(file)}>
                                    <Download className="mr-2 h-4 w-4"/>
                                    Download
                               </Button>
                            </li>
                        ))}
                    </ul>
                )}
                {(!solutionsLoading && solutions.length === 0) && (
                     <div className="text-center py-12 text-slate-400">
                        <p>You have no saved solutions yet.</p>
                        <Button variant="link" asChild><Link href="/">Solve a question to get started!</Link></Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
