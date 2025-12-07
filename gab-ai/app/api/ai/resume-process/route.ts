import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { resumeParserInstruction } from "@/utils/systemInstructions/resumeParserInstruction";
import { PDFDocument, rgb } from "pdf-lib";
import JSZip from "jszip";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

/**
 * Extract text from DOCX file
 * DOCX files are ZIP archives containing XML files
 */
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
        const zip = new JSZip();
        await zip.loadAsync(buffer);
        
        // DOCX files store the main content in document.xml
        const docXmlFile = zip.file('word/document.xml');
        if (!docXmlFile) {
            throw new Error("Invalid DOCX file: document.xml not found");
        }

        const xmlContent = await docXmlFile.async('string');
        
        // Simple regex to extract text from XML
        // This removes XML tags and extracts the text content
        let textContent = xmlContent
            .replace(/<[^>]*>/g, '') // Remove XML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();

        // Remove special Unicode characters that can't be encoded in WinAnsi
        // Replace them with ASCII equivalents or remove them
        textContent = textContent
            .replace(/[\u2000-\u200B]/g, ' ') // Replace various space characters with regular space
            .replace(/[\u2010-\u2015]/g, '-') // Replace various dashes with regular dash
            .replace(/[\u2018-\u2019]/g, "'") // Replace smart quotes with regular quote
            .replace(/[\u201C-\u201D]/g, '"') // Replace smart double quotes
            .replace(/[^\x00-\x7F]/g, ''); // Remove any remaining non-ASCII characters

        return textContent || 'No text content found in DOCX file';
    } catch (error) {
        console.error("Error extracting text from DOCX:", error);
        throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Convert DOCX/DOC files to PDF
 * Extracts text from DOCX and creates a PDF with the text content
 */
async function convertDocxToPdf(buffer: Buffer): Promise<Buffer> {
    try {
        // Extract text from DOCX
        const textContent = await extractTextFromDocx(buffer);

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([612, 792]); // Standard letter size
        
        const fontSize = 11;
        const margin = 50;
        const pageWidth = 612;
        const pageHeight = 792;
        const textWidth = pageWidth - (2 * margin);
        
        // Split text into lines based on approximate character width
        const charsPerLine = Math.floor(textWidth / (fontSize * 0.5)); // Rough estimate
        const lines: string[] = [];
        let currentIndex = 0;
        
        while (currentIndex < textContent.length) {
            lines.push(textContent.substring(currentIndex, currentIndex + charsPerLine));
            currentIndex += charsPerLine;
        }

        // Draw text on page
        let yPosition = pageHeight - margin;
        const lineHeight = fontSize + 4;

        for (const line of lines) {
            if (yPosition < margin) {
                // Create a new page if we run out of space
                page = pdfDoc.addPage([612, 792]);
                yPosition = pageHeight - margin;
            }

            page.drawText(line, {
                x: margin,
                y: yPosition,
                size: fontSize,
                color: rgb(0, 0, 0),
            });

            yPosition -= lineHeight;
        }

        // Convert to bytes
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    } catch (error) {
        console.error("Error converting DOCX to PDF:", error);
        throw new Error(`Failed to convert DOCX to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const fileName = (file as File).name.toLowerCase();
        const arrayBuffer = await (file as Blob).arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);

        // Check if file is DOCX/DOC and convert to PDF
        if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
            console.log(`Converting ${fileName} to PDF...`);
            const convertedBuffer = await convertDocxToPdf(buffer);
            buffer = Buffer.from(convertedBuffer);
        } else if (!fileName.endsWith('.pdf')) {
            // If it's not PDF, DOCX, or DOC, reject it
            return NextResponse.json({ 
                error: "Unsupported file format. Please upload PDF, DOCX, or DOC files." 
            }, { status: 400 });
        }

        const genAI = ai.getGenerativeModel({model:"gemini-2.5-flash-lite"});

        const result = await genAI.generateContent([
            resumeParserInstruction,
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: buffer.toString("base64")
                }
            }
        ]);

    const response = await result.response;
    const text = response.text();

    // Return both the summary and the PDF as base64
    return NextResponse.json({ 
        summary: text,
        pdfData: buffer.toString("base64")
    });
    
    } catch (error) {
        console.error("Error processing resume:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    
}