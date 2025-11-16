import { uploadResume as apiUploadResume } from '@/utils/api/api.uploadResume';

export async function uploadResume(file: File): Promise<string> {
  return apiUploadResume(file);
}