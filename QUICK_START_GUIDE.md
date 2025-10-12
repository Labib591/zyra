# PDF Block - Quick Start Guide

## 🚀 Getting Started

### Step 1: Configure Environment Variables

Add these to your `.env.local` file:

```env
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
```

### Step 2: Start the Development Server

```bash
npm run dev
```

### Step 3: Use the PDF Block

1. **Add PDF Block**: Click the PDF icon (📄) in the node palette on the right
2. **Upload PDF**: Click "Select PDF" and choose a file (max 10MB)
3. **Wait for Processing**: Text extraction happens automatically
4. **Connect to Chat**: Drag from PDF's top handle to chat's bottom handle
5. **Chat with Context**: Send messages - the AI will have access to PDF content

## 📋 Quick Tips

- **File Limit**: Maximum 10MB per PDF
- **Text Extraction**: Automatic - extracted text shown with character count
- **Multiple PDFs**: Connect multiple PDFs and notes to one chat block
- **View PDF**: Click "View/Download" to open the PDF in a new tab
- **Replace PDF**: Click "Replace" to upload a different file
- **Connection Direction**: PDF (top handle) → Chat (bottom handle)

## 🔍 Troubleshooting

### Upload fails with "Unauthorized"
- Check if you're logged in
- Verify Cloudinary credentials in `.env.local`

### No text extracted
- Some PDFs (image-based) may not have extractable text
- Try uploading a different PDF or one with text content

### Chat not receiving PDF context
- Verify the connection exists (line between blocks)
- Check that PDF has extracted text (green indicator)
- Look at console logs for "DATA SHARING DEBUG" messages

## 🎯 What Works Now

✅ Upload PDFs to Cloudinary  
✅ Automatic text extraction  
✅ Share PDF content with chat blocks  
✅ View/Download PDFs  
✅ Replace PDFs  
✅ Delete PDF blocks  
✅ Multiple data sources (notes + PDFs) to one chat  
✅ Visual status indicators  
✅ Error handling and validation  

## 📚 Need More Details?

See `PDF_IMPLEMENTATION_SUMMARY.md` for complete technical documentation.

