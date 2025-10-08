"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Canvas = {
  id: string;
  title: string;
  createdAt: string;
};

export default function MyCanvasesPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10">
      <Card className="w-full max-w-2xl mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">My Canvases</CardTitle>
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
                    <Button
                      onClick={() => router.push(`/canvases/${canvas.id}`)}
                      variant="default"
                    >
                      Go to Canvas
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
