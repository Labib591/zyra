import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canvases = await prisma.canvas.findMany({
        where: {
            userId: session.user.id,
            
        },
        include: {
            user: true,
        },
    });

    return NextResponse.json(canvases);
    
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await request.json();

    const canvas = await prisma.canvas.create({
        data: {
            title,
            userId: session.user.id,
            nodes: [],
            edges: [],
        },
        include: {
            user: true,
        },
    });

    return NextResponse.json(canvas);
}