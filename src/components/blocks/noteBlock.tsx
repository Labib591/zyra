import React, { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import CodeBlock from "@tiptap/extension-code-block";
import { Handle, Position, useNodeId } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useNodeStore } from "@/lib/store/store";

const MenuButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}> = ({ onClick, active, children, title }) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded-md text-sm border ${
        active ? "bg-gray-200" : "bg-white"
      } hover:bg-gray-100`}
      type="button"
    >
      {children}
    </button>
  );
};

export default function TiptapRichEditor({
  content = "Hello World<strong>!</strong>",
  onUpdate,
}: {
  content?: string;
  onUpdate?: (html: string) => void;
}) {
  const nodeId = useNodeId();
  const { deleteNode, setNodeData, noteData } = useNodeStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Get saved content from store
  const savedContent = nodeId ? noteData[nodeId] || content : content;

  const handleDeleteNode = () => {
    if (nodeId) {
      deleteNode(nodeId);
    }
  };

  // Base extensions that are safe and shipped with @tiptap/* packages
  const baseExtensions = [
    StarterKit,
    Underline,
    Link.configure({
      openOnClick: true,
      HTMLAttributes: {
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
    Image,
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    CodeBlock,
  ];

  // Keep extensions in state so we can add optional ones dynamically
  const [extensions, setExtensions] = useState(baseExtensions);

  // Try to dynamically import optional extensions that sometimes cause
  // compatibility issues when bundled with different versions of Tiptap.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Dynamically import; handle both ESM default and named exports.
        const textAlignModule = await import(
          "@tiptap/extension-text-align"
        ).then((m) => (m && (m.default || m)) as unknown);
        const placeholderModule = await import(
          "@tiptap/extension-placeholder"
        ).then((m) => (m && (m.default || m)) as unknown);

        if (cancelled) return;

        const extras: unknown[] = [];

        try {
          if (textAlignModule && typeof textAlignModule === 'object' && 'configure' in textAlignModule)
            extras.push(
              (textAlignModule as { configure: (config: { types: string[] }) => unknown }).configure({ types: ["heading", "paragraph"] })
            );
        } catch (e) {
          // configure might not exist or the module may be incompatible
          // just skip it.
          console.warn(
            "text-align extension incompatible or failed to configure:",
            e
          );
        }

        try {
          if (placeholderModule && typeof placeholderModule === 'object' && 'configure' in placeholderModule)
            extras.push(
              (placeholderModule as { configure: (config: { placeholder: string }) => unknown }).configure({ placeholder: "Start typing..." })
            );
        } catch (e) {
          console.warn(
            "placeholder extension incompatible or failed to configure:",
            e
          );
        }

        if (extras.length) setExtensions((prev) => [...prev, ...extras] as typeof prev);
      } catch (err) {
        // Optional extensions couldn't be imported (not installed / incompatible)
        // We intentionally swallow errors and keep a working editor.
        console.warn("Optional Tiptap extensions not loaded:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const editor = useEditor({
    extensions,
    content: savedContent,
    immediatelyRender: false,
    autofocus: "end",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate?.(html);
      setNodeData(nodeId || "", html);
    },
  });

  const addImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      editor?.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };

  const promptForImage = () => {
    fileInputRef.current?.click();
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = (editor.getAttributes("link") as { href?: string }).href || "";
    const url = window.prompt("Enter URL", previousUrl);
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white border rounded-md shadow-sm relative">
        {/* Top handles */}
        <Handle type="source" position={Position.Top} id="top-source" />
        {/* <Handle type="target" position={Position.Top} id="top-target" /> */}

        {/* Bottom handles */}
        <Handle type="target" position={Position.Bottom} id="bottom-source" />
        {/* <Handle type="target" position={Position.Bottom} id="bottom-target" /> */}

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 p-2 border-b relative">
          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteNode}
            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive z-10"
          >
            <X className="h-4 w-4" />
          </Button>
          <MenuButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={!!editor && editor.isActive("bold")}
            title="Bold"
          >
            <strong>B</strong>
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={!!editor && editor.isActive("italic")}
            title="Italic"
          >
            <em>I</em>
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={!!editor && editor.isActive("underline")}
            title="Underline"
          >
            <span style={{ textDecoration: "underline" }}>U</span>
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={!!editor && editor.isActive("strike")}
            title="Strike"
          >
            S
          </MenuButton>

          <MenuButton
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={!!editor && editor.isActive("heading", { level: 1 })}
            title="H1"
          >
            H1
          </MenuButton>

          <MenuButton
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={!!editor && editor.isActive("heading", { level: 2 })}
            title="H2"
          >
            H2
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={!!editor && editor.isActive("bulletList")}
            title="Bullet list"
          >
            • List
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={!!editor && editor.isActive("orderedList")}
            title="Numbered list"
          >
            1. List
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={!!editor && editor.isActive("blockquote")}
            title="Blockquote"
          >
            ❝
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            active={!!editor && editor.isActive("codeBlock")}
            title="Code block"
          >
            {"</>"}
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            —
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().undo().run()}
            title="Undo"
          >
            ↶
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().redo().run()}
            title="Redo"
          >
            ↷
          </MenuButton>

          <MenuButton
            onClick={setLink}
            active={!!editor && editor.isActive("link")}
            title="Link"
          >
            🔗
          </MenuButton>

          <MenuButton onClick={promptForImage} title="Insert image">
            🖼
          </MenuButton>

          <MenuButton onClick={insertTable} title="Insert table">
            ⛶ Table
          </MenuButton>

          <MenuButton
            onClick={() =>
              editor?.chain().focus().clearNodes().unsetAllMarks().run()
            }
            title="Clear formatting"
          >
            Clear Formatting
          </MenuButton>

          <MenuButton
            onClick={() => editor?.chain().focus().setContent("").run()}
            title="Clear content"
          >
            Clear Content
          </MenuButton>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {editor ? `${editor.getText().length} chars` : ""}
            </span>
          </div>
        </div>

        {/* Hidden file input for images */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (file) addImage(file);
            e.currentTarget.value = "";
          }}
        />

        {/* Editor area */}
        <div className="p-4 min-h-[200px] prose prose-sm max-w-none">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
