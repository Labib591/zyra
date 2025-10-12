"use client";

import { useState } from 'react';
import { FileText, Eye } from 'lucide-react';

interface PDFThumbnailProps {
  url: string;
  onClick: () => void;
  fileName: string;
}

export default function PDFThumbnail({ url, onClick, fileName }: PDFThumbnailProps) {
  const [imageError, setImageError] = useState(false);

  // Generate thumbnail URL using Cloudinary's transformation API
  // This converts the first page of the PDF to a JPG image
  const getThumbnailUrl = (pdfUrl: string) => {
    if (!pdfUrl.includes('cloudinary.com')) {
      return null; // Can't generate thumbnail for non-Cloudinary URLs
    }

    // Transform Cloudinary URL: /upload/ -> /upload/f_jpg,pg_1,w_200/
    return pdfUrl.replace(
      '/upload/',
      '/upload/f_jpg,pg_1,w_200,h_250,c_fit/'
    );
  };

  const thumbnailUrl = getThumbnailUrl(url);

  return (
    <div 
      className="relative w-full aspect-[4/5] max-w-[200px] mx-auto cursor-pointer group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors bg-muted"
      onClick={onClick}
      title="Click to view PDF"
    >
      {thumbnailUrl && !imageError ? (
        <>
          <img
            src={thumbnailUrl}
            alt={`${fileName} preview`}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm bg-black/50 px-3 py-2 rounded flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Click to view
            </span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-3" />
          <p className="text-xs font-medium text-muted-foreground mb-1">{fileName}</p>
          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
            Click to view
          </span>
        </div>
      )}
    </div>
  );
}

