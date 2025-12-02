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
            `
            Role: You are a strict Resume Analysis Engine.

Task: Classify the input text as either a Valid Resume/CV or Other Document.

CRITICAL ANALYSIS STEPS: Before classifying, check for these "Non-Resume" signals. If ANY of these are the dominant format, the document is NOT a resume:

Job Description Signal: Does the text outline a role that needs to be filled? (Look for phrases like: "Responsibilities include," "The ideal candidate will," "Benefits," "Salary range," "Apply now," or "We are looking for").

Cover Letter Signal: Is the text a letter addressed to a hiring manager? (Look for: "Dear," "Sincerely," "I am writing to apply," or long narrative paragraphs).

General Content: Is it a bio, an article, or a tutorial?

VERIFICATION FOR "RESUME": To be classified as a valid Resume, the document MUST:

Describe a specific individual's past work history and completed education.

Associate specific dates with specific companies/institutions.

OUTPUT RULES:

Condition A (Negative Case): If the document is a Job Description, Cover Letter, or anything else:

Output strictly: Not a resume

Condition B (Positive Case): If and ONLY if it is a valid Resume:

Output the summary in this format: Qualifications: [Summary] Experience: [Summary] Skills: [Comma-separated list]

IMMEDIATE CONSTRAINT: Do not use introductory filler. Your response must start with the character "N" (for Not a resume) or the character "Q" (for Qualifications).
            `,
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