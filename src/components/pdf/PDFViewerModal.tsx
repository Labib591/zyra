"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Download,
  Printer,
  Maximize,
  Minimize,
  ExternalLink,
  X as CloseIcon,
} from 'lucide-react';

interface PDFViewerModalProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName: string;
}

export default function PDFViewerModal({ open, onClose, pdfUrl, fileName }: PDFViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  // Google Docs viewer URL for PDFs that can't be embedded directly
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const handleOpenExternal = () => {
    window.open(pdfUrl, '_blank');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isFullscreen, onClose]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (open) {
      setIframeError(false);
      setLoading(true);
      setUseGoogleViewer(false);
    }
  }, [open]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    if (!useGoogleViewer) {
      // First try Google Docs viewer
      setUseGoogleViewer(true);
      setLoading(true);
    } else {
      // Both methods failed
      setIframeError(true);
      setLoading(false);
    }
  };

  const tryDirectViewer = () => {
    setUseGoogleViewer(false);
    setIframeError(false);
    setLoading(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate mr-4">{fileName}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 flex-shrink-0"
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b bg-muted/30 flex flex-wrap items-center gap-2">
          {/* Viewer Status */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              {useGoogleViewer ? 'Loading via Google Viewer...' : 'Loading PDF...'}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleDownload} title="Download PDF">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} title="Print PDF">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenExternal} title="Open in new tab">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="h-4 w-4 mr-2" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize className="h-4 w-4 mr-2" />
                  Fullscreen
                </>
              )}
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}

          {!iframeError ? (
            <iframe
              src={useGoogleViewer ? googleViewerUrl : pdfUrl}
              className="w-full h-full border-0"
              title={fileName}
              style={{ minHeight: '70vh' }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center max-w-md mx-auto p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">PDF Cannot Be Displayed</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The PDF cannot be displayed directly in the browser. This is common with external hosting services.
                </p>
                <div className="space-y-2">
                  <Button onClick={handleOpenExternal} className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button variant="outline" onClick={handleDownload} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" onClick={tryDirectViewer} className="w-full">
                    Try Direct View
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with keyboard shortcuts hint */}
        <div className="px-6 py-2 border-t bg-muted/30 text-xs text-muted-foreground text-center">
          Use browser&apos;s PDF controls • ESC to close
        </div>
      </DialogContent>
    </Dialog>
  );
}

