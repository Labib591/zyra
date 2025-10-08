import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try{
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const canvases = await prisma.canvas.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        return NextResponse.json({ canvases });
    } catch (error) {
        console.error("Error fetching canvases:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
