import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { countTokens } from "@/lib/countTokens";

const MAX_INPUT_TOKENS = 5000;

export async function POST(request: NextRequest) {
    try {
        const { messages, context } = await request.json();

        // 1. Get the last message from the user
        const latestUserMessage = messages[messages.length - 1].content;
        
        // 2. Create the chat history, excluding the last user message
        const chatHistory = messages.slice(0, messages.length - 1).map((message: { role: string; content: string }) => ({
            role: message.role === 'assistant' ? 'model' : 'user', // Correct the role name
            parts: [{ text: message.content }],
        })) as Content[];

        // (Optional but recommended) You could still use a token counter here
        // to truncate chatHistory if it gets too long.

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Corrected model name

        // 3. Start a chat session with the history
        const chat = model.startChat({
            history: chatHistory,
            // You can add generationConfig here if needed
        });
        
        // 4. Create a clean prompt with instructions and the latest message
        const prompt = `
            Answer to user's message based on the context provided.
            Context: ${context || "No context provided."}
            
            User's message: "${latestUserMessage}"
        `;

        console.log("Sending prompt to AI:", prompt);
        console.log("With history:", JSON.stringify(chatHistory, null, 2));

        // 5. Send the prompt and get the response
        const result = await chat.sendMessage(prompt);
        const response = result.response.text();

        console.log("AI Response:", response);
        console.log("Token usage:", result.response.usageMetadata);

        return NextResponse.json({ response });

    } catch (error) {
        console.error("Error in chat API", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}