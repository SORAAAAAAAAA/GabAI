import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert blob to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    const contents = [
  { text: "Transcribe the human speech in the provided audio file strictly in English or Filipino based on the audio content. Ignore all background noise, music, non-human sounds, and speech in any other languages. If a segment is unintelligible, omit it entirely. Output only the raw transcript text. Do not include timestamps, speaker labels, or any introductory or concluding remarks."},
  {
    inlineData: {
      mimeType: "audio/webm",
      data: base64Audio,
    },
  },
];

    // Transcribe audio using Gemini
    const result = await genAI.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: contents,
    });

    let transcript = '';

    for await ( const chunk of result) {
      transcript += chunk.text;
    }

    return NextResponse.json({ 
      transcript: transcript,
      confidence: 0.95,
      isFinal: true
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
