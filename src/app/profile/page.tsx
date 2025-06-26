import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, LogOut, User } from "lucide-react";
import Link from 'next/link';

// Mock data for saved files
const savedFiles = [
    { id: 1, name: "Physics Problem - Kinematics", date: "2024-07-28" },
    { id: 2, name: "Calculus - Integration", date: "2024-07-27" },
    { id: 3, name: "Chemistry - Stoichiometry", date: "2024-07-25" },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                <User className="w-8 h-8"/>
                My Profile
            </h1>
            <Button variant="ghost" asChild>
                <Link href="/"><LogOut className="mr-2 h-4 w-4" /> Logout</Link>
            </Button>
        </header>

        <Card className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-200 border-purple-900/50">
            <CardHeader>
                <CardTitle className="text-slate-100">Saved Solutions</CardTitle>
                <CardDescription className="text-slate-400">
                    Download your previously solved questions as PDF.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {savedFiles.map((file) => (
                        <li key={file.id} className="flex justify-between items-center p-4 rounded-lg bg-slate-800 hover:bg-slate-700/80 transition-colors">
                           <div className="flex items-center gap-4">
                             <FileText className="w-6 h-6 text-primary"/>
                             <div>
                                <p className="font-semibold text-slate-100">{file.name}</p>
                                <p className="text-sm text-slate-400">Saved on {file.date}</p>
                             </div>
                           </div>
                           <Button size="sm">
                                <Download className="mr-2 h-4 w-4"/>
                                Download
                           </Button>
                        </li>
                    ))}
                </ul>
                {savedFiles.length === 0 && (
                     <div className="text-center py-12 text-slate-400">
                        <p>You have no saved solutions yet.</p>
                        <p>Go back and solve a question to save it!</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
