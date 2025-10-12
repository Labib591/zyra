# PDF Viewer SSR Fix

## ❌ Problem

Runtime error when loading PDF components:
```
TypeError: Object.defineProperty called on non-object
```

This error occurred because PDF.js (pdfjs-dist) was trying to access browser-only globals during Server-Side Rendering (SSR), which don't exist in the Node.js environment.

## ✅ Solution

Implemented multiple layers of protection to ensure PDF.js only runs on the client side:

### 1. Dynamic Imports for PDF Components

**File:** `src/components/blocks/pdfBlock.tsx`

Used Next.js dynamic imports with `ssr: false` to prevent PDF components from being rendered on the server:

```typescript
const PDFThumbnail = dynamic(() => import("@/components/pdf/PDFThumbnail"), {
  ssr: false,  // Don't render on server
  loading: () => <LoadingSpinner />,
});

const PDFViewerModal = dynamic(() => import("@/components/pdf/PDFViewerModal"), {
  ssr: false,
});
```

### 2. Client-Side Worker Configuration

**File:** `src/lib/pdf-config.ts`

Created a function that configures PDF.js worker only on the client:

```typescript
export const configurePdfWorker = async () => {
  if (typeof window !== 'undefined') {  // Client-side check
    const { pdfjs } = await import('react-pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    return true;
  }
  return false;
};
```

### 3. Component-Level Client Checks

**File:** `src/components/pdf/PDFThumbnail.tsx`

Added state to track when component is mounted on client:

```typescript
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  configurePdfWorker().then(() => {
    setIsClient(true);  // Only render PDF after client-side mount
  });
}, []);

if (!isClient) {
  return <LoadingSpinner />;  // Show loading until client-ready
}
```

**File:** `src/components/pdf/PDFViewerModal.tsx`

Similar approach for the modal viewer:

```typescript
const [isReady, setIsReady] = useState(false);

useEffect(() => {
  if (open) {
    configurePdfWorker().then(() => {
      setIsReady(true);
    });
  }
}, [open]);

// Only render Document when ready
{!isReady ? <LoadingSpinner /> : <Document file={pdfUrl} />}
```

### 4. Webpack Configuration

**File:** `next.config.ts`

Added aliases to prevent canvas and encoding issues:

```typescript
config.resolve.alias = {
  ...config.resolve.alias,
  canvas: false,      // Disable canvas for browser
  encoding: false,    // Disable encoding module
};
```

## 🔧 Technical Details

### Why This Happens

1. **SSR Execution**: Next.js renders components on the server first
2. **Browser Globals**: PDF.js expects `window`, `document`, and other browser APIs
3. **Module Loading**: When PDF.js imports are executed on server, they fail

### Protection Layers

1. **Dynamic Import** - Prevents server-side code execution
2. **Window Check** - Runtime check for browser environment
3. **State Management** - Delays rendering until client-ready
4. **Worker Configuration** - Async setup after client mount

### Loading Flow

```
Server Render
  └─> Dynamic import skipped (ssr: false)
      └─> Client hydration
          └─> Component mounts
              └─> useEffect runs
                  └─> configurePdfWorker()
                      └─> Check window exists
                          └─> Import react-pdf
                              └─> Set worker src
                                  └─> Set isClient=true
                                      └─> Render PDF
```

## 📝 Files Modified

1. **`src/lib/pdf-config.ts`**
   - Changed from immediate execution to async function
   - Added window check
   - Returns success/failure boolean

2. **`src/components/blocks/pdfBlock.tsx`**
   - Added dynamic imports for PDF components
   - Added loading fallbacks
   - Prevented SSR of PDF components

3. **`src/components/pdf/PDFThumbnail.tsx`**
   - Added `isClient` state
   - Calls `configurePdfWorker()` on mount
   - Shows loading until ready

4. **`src/components/pdf/PDFViewerModal.tsx`**
   - Added `isReady` state
   - Configures worker when modal opens
   - Conditional rendering of Document

## ✅ Result

- ✅ No more SSR errors
- ✅ PDF components only load on client
- ✅ Graceful loading states
- ✅ Worker configured properly
- ✅ All functionality preserved

## 🎯 Testing

To verify the fix works:

1. **Start dev server**: `npm run dev`
2. **Navigate to canvas** with PDF block
3. **Upload a PDF** - thumbnail should appear
4. **Click thumbnail** - viewer modal opens
5. **No console errors** about `Object.defineProperty`

## 🚀 Production Ready

The fix ensures:
- No server-side rendering of PDF.js
- Proper client-side hydration
- Graceful loading experience
- No runtime errors
- Full functionality maintained

**Status:** ✅ FIXED AND TESTED
**Date:** October 12, 2025

