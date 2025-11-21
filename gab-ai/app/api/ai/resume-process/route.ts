import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await (file as Blob).arrayBuffer();

        const genAI = ai.getGenerativeModel({model:"gemini-2.5-flash-lite"});

        const result = await genAI.generateContent([
            "Determine the document if its a resume/cv and provide a concise summary of the candidate's qualifications, experience, and skills based on the content of the resume. If not a resume/cv, always respond with this message only do not add anything else:'Not a resume'.",
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: Buffer.from(arrayBuffer).toString("base64")
                }
            }
        ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });
    
    } catch (error) {
        console.error("Error processing resume:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    
}