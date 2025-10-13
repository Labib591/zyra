"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";

type Canvas = {
  id: string;
  title: string;
  createdAt: string;
};

export default function MyCanvasesPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [canvasTitle, setCanvasTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingCanvasId, setDeletingCanvasId] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    async function fetchCanvases() {
      // Wait for session to load
      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated" || !session?.user?.email) {
        setError("You must be logged in to view your canvases.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch canvases for the logged-in user
        const res = await fetch("/api/myCanvases", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch canvases");
        }

        const data = await res.json();
        setCanvases(data.canvases || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchCanvases();
  }, [session, status]);

  const handleCreateCanvas = async () => {
    if (!canvasTitle?.trim()) return;
    setIsCreating(true);
    try {
      const response = await axios.post("/api/canvases", 
        { title: canvasTitle.trim() },
        { withCredentials: true }
      );
      const canvasId = response?.data?.id;
      setIsDialogOpen(false);
      setCanvasTitle("");
      if (canvasId !== undefined && canvasId !== null) {
        router.push(`/canvases/${canvasId}`);
      } else {
        alert("Failed to create canvas");
      }
    } catch (error) {
      console.error("Error creating canvas:", error);
      alert("Failed to create canvas. Please make sure you're logged in.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCanvas = async (canvasId: string) => {
    if (!confirm("Are you sure you want to delete this canvas? This action cannot be undone.")) {
      return;
    }

    setDeletingCanvasId(canvasId);
    try {
      await axios.delete(`/api/canvases/${canvasId}`, {
        withCredentials: true,
      });
      
      // Remove the deleted canvas from the list
      setCanvases(canvases.filter(canvas => canvas.id !== canvasId));
    } catch (error) {
      console.error("Error deleting canvas:", error);
      alert("Failed to delete canvas. Please try again.");
    } finally {
      setDeletingCanvasId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10">
      <Card className="w-full max-w-2xl mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">My Canvases</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Canvas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-destructive py-8">{error}</div>
          ) : canvases.length === 0 ? (
            <div className="text-center py-8">No canvases found.</div>
          ) : (
            <div className="grid gap-6">
              {canvases.map((canvas) => (
                <Card key={canvas.id} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{canvas.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-xs text-gray-400">
                      Created: {new Date(canvas.createdAt).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push(`/canvases/${canvas.id}`)}
                        variant="default"
                        className="flex-1"
                      >
                        Go to Canvas
                      </Button>
                      <Button
                        onClick={() => handleDeleteCanvas(canvas.id)}
                        variant="destructive"
                        size="icon"
                        disabled={deletingCanvasId === canvas.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Canvas Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Canvas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="canvas-title">Canvas Title</Label>
              <Input
                id="canvas-title"
                placeholder="Enter canvas title..."
                value={canvasTitle}
                onChange={(e) => setCanvasTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canvasTitle.trim()) {
                    handleCreateCanvas();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setCanvasTitle("");
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCanvas}
              disabled={!canvasTitle.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
