"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, MessageSquare, Zap, ArrowRight } from "lucide-react";
import axios from "axios";
import Navbar from "../Navbar";
import { toast } from "sonner";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

export default function Homepage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [canvasTitle, setCanvasTitle] = useState("");

  // const session = getServerSession(authOptions);
  // console.log("Session status:", session);

  const handleCreateCanvas = async (title: string) => {
    if (!title?.trim()) return;
    setIsCreating(true);
    try {
      // console.log("Session status:", session);
      const response = await axios.post("/api/canvases", 
        { title: title.trim() },
        { withCredentials: true }
      );
      const canvasId = response?.data?.id;
      setIsDialogOpen(false);
      setCanvasTitle("");
      if (canvasId !== undefined && canvasId !== null) {
        toast("Canvas created successfully");
        router.push(`/canvases/${canvasId}`);
      }
      else {
        toast("Failed to create canvas");
      }
    } catch (error) {
      console.error("Error creating canvas:", error);
      toast("Failed to create canvas. Please make sure you're logged in.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Zyra
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Your intelligent canvas for notes, AI conversations, and creative workflows. 
            Connect ideas, collaborate with AI, and bring your thoughts to life.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => setIsDialogOpen(true)}
              disabled={isCreating}
              size="lg"
              className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating Canvas...
                </>
              ) : (
                <>
                  Create New Canvas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 h-auto border-primary text-primary hover:bg-primary/10 transition-all duration-200 transform hover:scale-105"
              onClick={() => router.push("/register")}
            >
              Register
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => { setIsDialogOpen(open); if (!open) setCanvasTitle(""); }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Canvas</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateCanvas(canvasTitle);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="canvas-title">Title</Label>
                  <Input
                    id="canvas-title"
                    placeholder="e.g. Product Brainstorm"
                    value={canvasTitle}
                    onChange={(e) => setCanvasTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating || !canvasTitle.trim()}>
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl w-fit mb-4">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Rich Notes</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Create beautiful, formatted notes with our rich text editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  Text formatting & styling
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  Images & media support
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  Tables & lists
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-3 bg-green-100 dark:bg-green-900/20 rounded-xl w-fit mb-4">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">AI Conversations</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Chat with AI that understands your notes and context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  Context-aware responses
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  Multiple chat sessions
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  Real-time conversations
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl w-fit mb-4">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Visual Canvas</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Connect ideas with an intuitive visual interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                  Drag & drop interface
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                  Node connections
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                  Infinite canvas space
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-500 dark:text-slate-400">
          <p>Start your creative journey with Zyra</p>
        </div>
      </div>
    </div>
  );
}
