'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Download, LogOut, User, Loader2, Home, Pencil } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { collection, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore";
import jsPDF from 'jspdf';
import { Logo } from "@/components/icons/logo";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);
    const { toast } = useToast();

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                await currentUser.reload();
                
                if (!currentUser.emailVerified) {
                    router.push('/verify-email');
                    return;
                }

                setUser(currentUser);
                setNewName(currentUser.displayName || "");

                try {
                    setSolutionsLoading(true);
                    const q = query(collection(db, "solutions"), where("userId", "==", currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    const fetchedSolutions = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as SavedSolution[];
                    
                    fetchedSolutions.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

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

        return () => unsubscribe();
    }, [router]);

    const handleNameUpdate = async () => {
        if (!user || !newName.trim()) {
            toast({ title: "Error", description: "Name cannot be empty.", variant: "destructive" });
            return;
        }
        setIsSavingName(true);
        try {
            await updateProfile(user, { displayName: newName.trim() });
            setUser(prevUser => prevUser ? { ...prevUser, displayName: newName.trim() } : null);
            toast({ title: "Success", description: "Your name has been updated." });
            setIsEditingName(false);
        } catch (error) {
            console.error("Error updating profile name:", error);
            toast({ title: "Error", description: "Failed to update your name.", variant: "destructive" });
        } finally {
            setIsSavingName(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
    
        setIsUploading(true);
        try {
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);
            await updateProfile(user, { photoURL });
            setUser(prevUser => prevUser ? { ...prevUser, photoURL } : null);
            toast({ title: "Success", description: "Profile picture updated!" });
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            toast({ title: "Error", description: "Failed to upload picture.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };


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
        const sanitizedSolution = solution.solution.replace(/\$\$|(?<!\$)\$|\$(?!\$)/g, '');
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
    
    if (loading || !user) {
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
                <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
        </header>
        
        <div className="flex items-center gap-6 mb-8">
             <div className="relative group">
                <Avatar className="w-20 h-20 text-lg border-2 border-primary/50">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback>
                        <User className="w-10 h-10" />
                    </AvatarFallback>
                </Avatar>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isUploading}
                    aria-label="Upload profile picture"
                >
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload}
                    className="hidden" 
                    accept="image/png, image/jpeg" 
                />
            </div>

            <div>
                 {isEditingName ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Input 
                            type="text" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter your name"
                            className="bg-slate-800/70 border-slate-700 text-base"
                            onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleNameUpdate} disabled={isSavingName} size="sm">
                                {isSavingName ? <Loader2 className="animate-spin" /> : "Save"}
                            </Button>
                            <Button variant="ghost" onClick={() => setIsEditingName(false)} size="sm">Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-100">{user?.displayName || "My Profile"}</h1>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditingName(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <p className="text-slate-400 mt-1">{user?.email}</p>
            </div>
        </div>


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
                                    <p className="font-semibold text-slate-100">{file.identifiedSubject} Question</p>
                                    <p className="text-sm text-slate-400">Saved on {file.createdAt.toDate().toLocaleDateString()}</p>
                                 </div>
                               </div>
                               <Button size="sm" onClick={() => handleDownload(file)} className="self-end sm:self-center">
                                    <Download className="mr-2 h-4 w-4"/>
                                    Download Pdf
                               </Button>
                            </li>
                        ))}
                    </ul>
                )}
                {(!solutionsLoading && solutions.length === 0) && (
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
