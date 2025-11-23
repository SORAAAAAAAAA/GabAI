import { execFile } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function convertWebMTo16BitPCM(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${Date.now()}.webm`);
    const outputPath = path.join(tempDir, `output-${Date.now()}.wav`);

    // Write input buffer to temp file
    fs.writeFileSync(inputPath, inputBuffer);

    if (!ffmpegStatic) {
      return reject(new Error('ffmpeg binary not found'));
    }
    // Run ffmpeg
    execFile(ffmpegStatic, [
      '-i', inputPath,
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      outputPath
    ], (error: Error | null) => {
      if (error) {
        fs.unlinkSync(inputPath);
        return reject(error);
      }

      const outputBuffer = fs.readFileSync(outputPath);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      resolve(outputBuffer);
    });
  });
}