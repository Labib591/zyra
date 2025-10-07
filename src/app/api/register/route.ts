import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: NextRequest){
   try{

    const {name, email, password} = await request.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data:{
            name:name,
            email:email,
            password:hashedPassword,
        }
    })

    return NextResponse.json({message: "User created", user})
   }
   catch(error){
    console.log(error);
    return NextResponse.json("User creation failed", {status: 500});
   }
}