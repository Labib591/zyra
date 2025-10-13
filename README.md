# Zyra

Your intelligent canvas for notes, AI conversations, and creative workflows. Connect ideas, collaborate with AI, and bring your thoughts to life.

## ✨ Features

### 🎨 Visual Canvas
- **Infinite Canvas**: Drag and drop interface with unlimited space for your ideas
- **Node Connections**: Connect related concepts with visual links
- **Real-time Collaboration**: Share and collaborate on your canvas

### 📝 Rich Text Editor
- **Full-Featured Editor**: Built with TipTap for powerful text editing
- **Formatting Options**: Bold, italic, underline, strikethrough, headings
- **Media Support**: Insert images, links, tables, and code blocks
- **Lists & Quotes**: Bullet points, numbered lists, and blockquotes
- **Auto-save**: Content automatically saved to your canvas

### 🤖 AI-Powered Chat
- **Context-Aware AI**: Chat with AI that understands your notes and context
- **Multiple Sessions**: Each chat node maintains its own conversation history
- **Connected Intelligence**: AI responses are enhanced by content from connected note blocks
- **Real-time Responses**: Powered by Google's Gemini AI model

### 📄 PDF Support
- **PDF Upload**: Upload and view PDF documents directly on your canvas
- **Text Extraction**: Automatically extract text from PDFs for AI context
- **PDF Viewer**: Built-in modal viewer with thumbnail preview
- **AI Integration**: PDFs can be connected to chat blocks for document-based conversations

### 🎯 Node Types
- **Note Blocks**: Rich text editor for capturing ideas, thoughts, and information
- **Chat Blocks**: AI conversation nodes that can reference connected notes
- **PDF Blocks**: Upload and view PDF documents, with extracted text available for AI context

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zyra
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/zyra"

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# AI
GEMINI_API_KEY=your_google_gemini_api_key_here

# File Upload (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

7. Create an account by visiting [http://localhost:3000/register](http://localhost:3000/register)

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Component library
- **Lucide React** - Icon library

### Canvas & Editor
- **@xyflow/react** - Visual flow diagrams and canvas
- **@tiptap/react** - Rich text editor
- **TipTap Extensions**:
  - Starter Kit (bold, italic, lists, etc.)
  - Tables, Links, Images
  - Code blocks, Text alignment
  - Placeholder text

### Database & Backend
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **NextAuth.js** - Authentication system
- **bcrypt** - Password hashing

### State Management & Data Fetching
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management and data fetching
- **Persistent Storage** - Canvas state saved to database

### AI Integration
- **@google/generative-ai** - Google Gemini AI integration
- **Context-aware responses** - AI understands connected note and PDF content

### File Management
- **Cloudinary** - Cloud-based file storage and delivery
- **unpdf** - PDF text extraction
- **Axios** - HTTP client for API requests

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Sass** - CSS preprocessing

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth authentication
│   │   ├── chat/          # AI chat endpoint
│   │   ├── canvases/      # Canvas CRUD operations
│   │   ├── notes/         # Note operations
│   │   ├── pdfs/          # PDF upload and management
│   │   └── register/      # User registration
│   ├── canvases/          # Canvas pages
│   │   └── [id]/          # Dynamic canvas routes
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── blocks/            # Canvas node components
│   │   ├── chatBlock.tsx  # AI chat node
│   │   ├── noteBlock.tsx  # Rich text note node
│   │   └── pdfBlock.tsx   # PDF viewer node
│   ├── canvas/            # Canvas-related components
│   │   ├── Canvas.tsx     # Main canvas component
│   │   └── NodePalette.tsx # Node creation palette
│   ├── homepage/          # Homepage components
│   ├── pdf/               # PDF components
│   │   ├── PDFThumbnail.tsx    # PDF thumbnail preview
│   │   └── PDFViewerModal.tsx  # Full PDF viewer modal
│   ├── providers/         # React context providers
│   │   ├── QueryProvider.tsx   # TanStack Query provider
│   │   └── SessionProvider.tsx # NextAuth session provider
│   ├── tiptap-ui/         # TipTap editor UI components
│   ├── tiptap-ui-primitive/ # Base UI primitives
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   ├── use-mobile.ts      # Mobile detection
│   ├── use-tiptap-editor.ts # TipTap editor hook
│   ├── useCanvasQueries.ts  # Canvas data fetching
│   └── useDebounce.ts     # Debounce hook
├── lib/                   # Utility libraries
│   ├── store/             # Zustand stores
│   │   ├── chatStore.ts   # Chat state management
│   │   └── store.ts       # Canvas state management
│   ├── types/             # TypeScript type definitions
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── tiptap-utils.ts    # TipTap utilities
│   └── utils.ts           # General utilities
├── styles/                # SCSS stylesheets
│   ├── _variables.scss    # SCSS variables
│   └── _keyframe-animations.scss # Animation keyframes
└── generated/             # Generated Prisma client
    └── prisma/            # Prisma client files
```

## 🎮 Usage

### Getting Started
1. Register for an account at `/register`
2. Log in with your credentials
3. You'll be redirected to your canvas dashboard

### Creating a Canvas
1. Click "Create New Canvas" from the homepage
2. You'll be redirected to a new canvas with a unique ID
3. Your canvas is automatically saved to the database

### Adding Nodes
1. Use the node palette in the top-right corner
2. Click the "Note" icon to add a text editor node
3. Click the "AI" icon to add a chat node
4. Click the "PDF" icon to upload and add a PDF document
5. Drag nodes around the canvas to organize your thoughts

### Connecting Ideas
1. Click and drag from any node's connection handle
2. Connect to another node to create a relationship
3. AI chat nodes will use content from connected note blocks as context

### Rich Text Editing
- Use the toolbar for formatting options
- Insert images by clicking the image button
- Add tables, links, and code blocks
- Content automatically saves as you type

### AI Conversations
- Add a chat node to start an AI conversation
- Connect note blocks or PDF blocks to provide context for the AI
- Each chat node maintains its own conversation history
- AI responses are enhanced by connected note and PDF content

### Working with PDFs
- Upload PDF files by adding a PDF block
- View PDFs in a modal by clicking on the block
- Text is automatically extracted from PDFs
- Connect PDFs to chat blocks to discuss document content with AI

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js session encryption
- `NEXTAUTH_URL` - Base URL for authentication callbacks
- `GEMINI_API_KEY` - Your Google Gemini API key (required for AI features)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name for file uploads
- `NEXT_PUBLIC_CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Customization
- Modify `src/app/globals.css` for global styling
- Update `src/lib/store/store.ts` for canvas behavior
- Customize AI prompts in `src/app/api/chat/route.ts`
- Modify database schema in `prisma/schema.prisma`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio to view/edit database
- `npx prisma migrate dev` - Create and apply database migrations
- `npx prisma generate` - Generate Prisma client

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [TipTap](https://tiptap.dev/) for the rich text editor
- [@xyflow/react](https://xyflow.com/) for the canvas functionality
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Prisma](https://www.prisma.io/) for database ORM
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [TanStack Query](https://tanstack.com/query) for data fetching
- [Cloudinary](https://cloudinary.com/) for file storage

---

**Start your creative journey with Zyra!** 🚀