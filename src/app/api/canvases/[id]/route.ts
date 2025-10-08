import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: canvasId } = await params;

    // Check if canvas exists
    const canvas = await prisma.canvas.findUnique({
        where: {
            id: canvasId,
        },
        include: {
            user: true,
            messages: {
                orderBy: {
                    createdAt: 'asc'
                }
            },
            notes: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        },
    });

    if (!canvas) {
        return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    // Check if canvas belongs to the user
    if (canvas.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(canvas);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: canvasId } = await params;

    // Check if canvas exists and belongs to user
    const existingCanvas = await prisma.canvas.findUnique({
        where: {
            id: canvasId,
        },
    });

    if (!existingCanvas) {
        return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    if (existingCanvas.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, nodes, edges } = await request.json();

    const updatedCanvas = await prisma.canvas.update({
        where: {
            id: canvasId,
        },
        data: {
            ...(title !== undefined && { title }),
            ...(nodes !== undefined && { nodes }),
            ...(edges !== undefined && { edges }),
        },
        include: {
            user: true,
        },
    });

    return NextResponse.json(updatedCanvas);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: canvasId } = await params;

    // Check if canvas exists and belongs to user
    const existingCanvas = await prisma.canvas.findUnique({
        where: {
            id: canvasId,
        },
    });

    if (!existingCanvas) {
        return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    if (existingCanvas.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.canvas.delete({
        where: {
            id: canvasId,
        },
    });

    return NextResponse.json({ message: "Canvas deleted successfully" });
}

