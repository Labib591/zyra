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

### 🎯 Node Types
- **Note Blocks**: Rich text editor for capturing ideas, thoughts, and information
- **Chat Blocks**: AI conversation nodes that can reference connected notes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

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
Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_google_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

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

### State Management
- **Zustand** - Lightweight state management
- **Persistent Storage** - Automatic saving to localStorage

### AI Integration
- **@google/generative-ai** - Google Gemini AI integration
- **Context-aware responses** - AI understands connected note content

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Sass** - CSS preprocessing

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── chat/          # AI chat endpoint
│   ├── canvases/          # Canvas pages
│   │   └── [id]/          # Dynamic canvas routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── blocks/            # Canvas node components
│   │   ├── chatBlock.tsx  # AI chat node
│   │   └── noteBlock.tsx  # Rich text note node
│   ├── canvas/            # Canvas-related components
│   │   ├── Canvas.tsx     # Main canvas component
│   │   └── NodePalette.tsx # Node creation palette
│   ├── homepage/          # Homepage components
│   ├── tiptap-ui/         # TipTap editor UI components
│   ├── tiptap-ui-primitive/ # Base UI primitives
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   ├── use-mobile.ts      # Mobile detection
│   └── use-tiptap-editor.ts # TipTap editor hook
├── lib/                   # Utility libraries
│   ├── store/             # Zustand stores
│   │   ├── chatStore.ts   # Chat state management
│   │   └── store.ts       # Canvas state management
│   ├── types/             # TypeScript type definitions
│   ├── context/           # React context providers
│   ├── tiptap-utils.ts    # TipTap utilities
│   └── utils.ts           # General utilities
└── styles/                # SCSS stylesheets
    ├── _variables.scss    # SCSS variables
    └── _keyframe-animations.scss # Animation keyframes
```

## 🎮 Usage

### Creating a Canvas
1. Visit the homepage
2. Click "Create New Canvas"
3. You'll be redirected to a new canvas with a unique ID

### Adding Nodes
1. Use the node palette in the top-right corner
2. Click the "Note" icon to add a text editor node
3. Click the "AI" icon to add a chat node
4. Drag nodes around the canvas to organize your thoughts

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
- Connect note blocks to provide context for the AI
- Each chat node maintains its own conversation history
- AI responses are enhanced by connected note content

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY` - Your Google Gemini API key (required for AI features)

### Customization
- Modify `src/app/globals.css` for global styling
- Update `src/lib/store/store.ts` for canvas behavior
- Customize AI prompts in `src/app/api/chat/route.ts`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

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

---

**Start your creative journey with Zyra!** 🚀