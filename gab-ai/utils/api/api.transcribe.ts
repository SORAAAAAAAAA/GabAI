export async function transcribeAPI(audioBlob: FormData) {
    const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: audioBlob,
    })

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Transcription failed: ${errorText}`);
    }
    return response;
}