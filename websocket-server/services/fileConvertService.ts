
export function pcmToWav(pcmData: ArrayBuffer, sampleRate: number, channels: number, bitDepth: number): ArrayBuffer {
  const wav = new ArrayBuffer(44 + pcmData.byteLength);
  const view = new DataView(wav);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.byteLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * (bitDepth / 8), true); // byte rate
  view.setUint16(32, channels * (bitDepth / 8), true); // block align
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.byteLength, true);

  // Copy PCM data
  const pcmView = new Uint8Array(pcmData);
  const wavView = new Uint8Array(wav);
  wavView.set(pcmView, 44);

  return wav;
}


export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
} 