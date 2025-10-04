import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    try{
        const {messages, context} = await request.json();

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Answer to users messages based on the context provided. If no context is provided, answer based on the messages.
        Context: ${context}
        Messages: ${messages.map((message: { role: string; content: string }) => `${message.role}: ${message.content}`).join("\n")}
        `;
        
        console.log("Prompt sent to AI:", prompt);

        const generationConfig = {
            maxOutputTokens: 500,
          };

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig
        });
        const response = result.response.text();
        console.log("Response", response);

        return NextResponse.json({response});
    }
    catch(error){
        console.error("Error in chat API", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }


}