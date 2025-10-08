import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest){
   try{

    const {name, email, password} = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data:{
            name: name || "User",
            email: email,
            password: hashedPassword,
        }
    })

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "User created",
      user: userWithoutPassword
    })
   }
   catch(error){
    console.error("Registration error:", error);
    
    // Better error logging for debugging
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "User creation failed", details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "User creation failed" },
      { status: 500 }
    );
   }
}