import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get canvasId from query params
    const { searchParams } = new URL(request.url);
    const canvasId = searchParams.get('canvasId');

    if (!canvasId) {
        return NextResponse.json({ error: "Canvas ID required" }, { status: 400 });
    }

    const notes = await prisma.note.findMany({
        where:{
            userId: session.user.id,
            canvasId: canvasId,
        },
        orderBy: {
            createdAt: "desc",
        }
    })
    
    return NextResponse.json(notes);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { content, canvasId, noteId } = await request.json();

    // Note: The noteId is the actual node ID in the canvas
    const note = await prisma.note.create({
        data: {
            id: noteId, // Use the provided nodeId as the note ID
            content,
            canvasId,
            userId: session.user.id,
        }
    })
    
    return NextResponse.json(note);
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, noteId } = await request.json();

    // Verify the note belongs to the user
    const existingNote = await prisma.note.findFirst({
        where: {
            id: noteId,
            userId: session.user.id,
        }
    });

    if (!existingNote) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const note = await prisma.note.update({
        where: {
            id: noteId,
        },
        data: {
            content,
        }
    })
    
    return NextResponse.json(note);
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { noteId } = await request.json();

    // Verify the note belongs to the user
    const existingNote = await prisma.note.findFirst({
        where: {
            id: noteId,
            userId: session.user.id,
        }
    });

    if (!existingNote) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const note = await prisma.note.delete({
        where: {
            id: noteId,
        }
    })
    
    return NextResponse.json(note);
}
