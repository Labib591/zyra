import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { extractText } from "unpdf";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Configure Cloudinary
    if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
      console.error("Missing Cloudinary credentials!");
      return NextResponse.json(
        { error: "Server configuration error: Missing Cloudinary credentials" },
        { status: 500 }
      );
    }
    
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const canvasId = formData.get("canvasId") as string;
    const blockId = formData.get("blockId") as string;

    if (!file || !canvasId || !blockId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Verify canvas belongs to user
    const canvas = await prisma.canvas.findUnique({
      where: { id: canvasId },
    });

    if (!canvas || canvas.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Canvas not found or unauthorized" },
        { status: 403 }
      );
    }

    // Convert file to ArrayBuffer
    const bytes = await file.arrayBuffer();
    
    // Create a Uint8Array from the ArrayBuffer
    const uint8Array = new Uint8Array(bytes);
    
    // Create a Buffer by COPYING the Uint8Array data (not sharing the ArrayBuffer!)
    const buffer = Buffer.from(uint8Array);

    // Extract text from PDF
    let extractedText = "";
    try {
      const { text } = await extractText(uint8Array, { mergePages: true });
      extractedText = text || "";
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      extractedText = ""; // Continue even if extraction fails
    }
    
    // Upload to Cloudinary using base64
    const base64String = buffer.toString('base64');
    
    if (!base64String || base64String.length === 0) {
      throw new Error("Failed to convert file to base64");
    }
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${base64String}`,
      {
        resource_type: "raw",
        folder: "zyra-pdfs",
        public_id: `${canvasId}_${blockId}_${Date.now()}`,
        format: "pdf",
      }
    );

    // console.log("Upload result:", uploadResult);

    // Save to database
    const pdf = await prisma.pDF.create({
      data: {
        canvasId,
        blockId,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        fileType: file.type,
        fileSize: file.size,
        extractedText,
      },
    });

    // console.log("PDF created:", pdf);

    return NextResponse.json(pdf);
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { error: "Failed to upload PDF" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { canvasId, blockId } = await request.json();

    if (!canvasId || !blockId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify canvas belongs to user
    const canvas = await prisma.canvas.findUnique({
      where: { id: canvasId },
    });

    if (!canvas || canvas.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Canvas not found or unauthorized" },
        { status: 403 }
      );
    }

    // Find PDF
    const pdf = await prisma.pDF.findFirst({
      where: {
        canvasId,
        blockId,
      },
    });

    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    // Extract public_id from URL to delete from Cloudinary
    try {
      const urlParts = pdf.fileUrl.split("/");
      const fileWithExtension = urlParts[urlParts.length - 1];
      const publicId = `zyra-pdfs/${fileWithExtension}`;
      
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error);
      // Continue even if Cloudinary deletion fails
    }

    // Delete from database
    await prisma.pDF.delete({
      where: { id: pdf.id },
    });

    return NextResponse.json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return NextResponse.json(
      { error: "Failed to delete PDF" },
      { status: 500 }
    );
  }
}

