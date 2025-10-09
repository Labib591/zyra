import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: canvasId } = await params;
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get('blockId');

    if (!blockId) {
        return NextResponse.json({ error: "blockId is required" }, { status: 400 });
    }

    // Verify canvas belongs to user
    const canvas = await prisma.canvas.findFirst({
        where: {
            id: canvasId,
            userId: session.user.id,
        }
    });

    if (!canvas) {
        return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
        where: {
            canvasId,
            blockId,
        },
        orderBy: {
            createdAt: "asc",
        }
    });

    return NextResponse.json(messages);
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: canvasId } = await params;
    const { content, role, blockId } = await request.json();

    // Verify canvas belongs to user
    const canvas = await prisma.canvas.findFirst({
        where: {
            id: canvasId,
            userId: session.user.id,
        }
    });

    if (!canvas) {
        return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    // Create message
    const message = await prisma.message.create({
        data: {
            canvasId,
            blockId,
            content,
            role: role === 'user' ? 'user' : 'assistant',
        }
    });

    return NextResponse.json(message);
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
    const { messageId, blockId } = await request.json();

    // Verify canvas belongs to user
    const canvas = await prisma.canvas.findFirst({
        where: {
            id: canvasId,
            userId: session.user.id,
        }
    });

    if (!canvas) {
        return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    // If messageId is provided, delete a specific message
    if (messageId) {
        // Verify message belongs to the blockId before deleting
        const message = await prisma.message.findFirst({
            where: {
                id: messageId,
                canvasId,
                blockId,
            }
        });

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // Delete message
        await prisma.message.delete({
            where: {
                id: messageId,
            }
        });

        return NextResponse.json(message);
    }

    // If only blockId is provided, delete all messages for that block
    if (blockId) {
        const result = await prisma.message.deleteMany({
            where: {
                canvasId,
                blockId,
            }
        });

        return NextResponse.json({ 
            success: true, 
            deletedCount: result.count 
        });
    }

    return NextResponse.json({ error: "messageId or blockId is required" }, { status: 400 });
}

