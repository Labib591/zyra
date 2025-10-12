"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, X, Download, Loader2 } from "lucide-react";
import { useNodeStore } from "@/lib/store/store";
import { useNodeId, Handle, Position } from "@xyflow/react";
import { useCreatePDF, useDeletePDF, usePDFsFromCache } from "@/hooks/useCanvasQueries";

// Dynamically import PDF components to avoid SSR issues
const PDFThumbnail = dynamic(() => import("@/components/pdf/PDFThumbnail"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/5] max-w-[200px] mx-auto border-2 border-gray-200 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

const PDFViewerModal = dynamic(() => import("@/components/pdf/PDFViewerModal"), {
  ssr: false,
});

export default function PdfBlock() {
  const nodeId = useNodeId();
  const { deleteNode, canvasId } = useNodeStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  // Get PDFs from TanStack Query cache
  const allPDFs = usePDFsFromCache(canvasId);
  // Find PDF for this specific block
  const pdf = allPDFs.find(p => p.blockId === nodeId);
  
  const createPDFMutation = useCreatePDF();
  const deletePDFMutation = useDeletePDF();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !nodeId || !canvasId) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      await createPDFMutation.mutateAsync({
        canvasId,
        blockId: nodeId,
        file,
      });
    } catch (error) {
      console.error("Error uploading PDF:", error);
      alert(error instanceof Error ? error.message : "Failed to upload PDF");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDeleteNode = async () => {
    if (nodeId && canvasId) {
      // Delete PDF from DB if it exists
      if (pdf) {
        await deletePDFMutation.mutateAsync({
          canvasId,
          blockId: nodeId,
        });
      }
      // Delete node from UI
      deleteNode(nodeId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="relative">
      <Card className="w-[400px] h-full flex flex-col relative">
        {/* Top handles */}
        <Handle type="source" position={Position.Top} />
        
        {/* Bottom handles */}
        <Handle type="target" position={Position.Bottom} />

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              PDF Document
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteNode}
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {!pdf ? (
            // Upload state
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium mb-1">Upload a PDF</p>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 10MB
                </p>
              </div>
              <Button
                onClick={handleFileSelect}
                disabled={uploading}
                className="mt-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Select PDF
                  </>
                )}
              </Button>
            </div>
          ) : (
            // PDF info display
            <div className="flex flex-col gap-4">
              {/* PDF Thumbnail - Clickable */}
              <div className="mb-2">
                <PDFThumbnail 
                  url={pdf.fileUrl}
                  fileName={pdf.fileName}
                  onClick={() => setViewerOpen(true)}
                />
              </div>

              {/* PDF Info */}
              <div className="border rounded-lg p-3 bg-muted/50">
                <div className="flex items-start gap-2">
                  <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={pdf.fileName}>
                      {pdf.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(pdf.fileSize)} • {new Date(pdf.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Text extraction status */}
              <div className="border rounded-lg p-3 bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${pdf.extractedText ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs font-medium">
                    Text Extraction
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {pdf.extractedText 
                    ? `${pdf.extractedText.length} characters extracted and ready to share`
                    : 'No text could be extracted from this PDF'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(pdf.fileUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFileSelect}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Replace"
                  )}
                </Button>
              </div>

              {/* Connection hint */}
              <div className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded">
                💡 Connect this block to a chat block to share PDF content
              </div>
            </div>
          )}

          {/* PDF Viewer Modal */}
          {pdf && (
            <PDFViewerModal
              open={viewerOpen}
              onClose={() => setViewerOpen(false)}
              pdfUrl={pdf.fileUrl}
              fileName={pdf.fileName}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

