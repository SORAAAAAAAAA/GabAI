/**
 * Custom Hook: useFileUpload
 * Refactored to use dependency injection
 * Single Responsibility: Handles file upload logic only
 */

import { useState, useCallback } from 'react';
import { ServiceContainer } from '@/src/application/di/ServiceContainer';
import { FileUploadState } from '@/src/shared/types';
import { validateFile } from '@/src/shared/utils/validation';
import { formatFileSize } from '@/src/shared/utils/common';

interface UseFileUploadReturn extends FileUploadState {
  uploadFile: (file: File) => Promise<void>;
  removeFile: () => void;
  formatFileSize: (bytes: number) => string;
}

export function useFileUpload(): UseFileUploadReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedResume, setParsedResume] = useState<string | null>(null);

  const resumeService = ServiceContainer.getInstance().getResumeService();
  const authService = ServiceContainer.getInstance().getAuthService();

  const createFilePreview = useCallback((file: File) => {
    console.log('Creating preview for file:', file.type, file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Image preview loaded');
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      console.log('Creating PDF object URL');
      const objectUrl = URL.createObjectURL(file);
      setFilePreview(`pdf:${objectUrl}`);
    } else if (
      file.type === 'text/plain' ||
      file.name.toLowerCase().endsWith('.txt') ||
      file.name.toLowerCase().endsWith('.json') ||
      file.name.toLowerCase().endsWith('.csv')
    ) {
      console.log('Reading text file content');
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = e.target?.result as string;
        setFilePreview(`text:${textContent}`);
      };
      reader.readAsText(file);
    } else if (
      file.type.includes('word') ||
      file.name.toLowerCase().endsWith('.doc') ||
      file.name.toLowerCase().endsWith('.docx')
    ) {
      console.log('Setting Word document preview');
      setFilePreview('doc-preview');
    } else {
      console.log('Setting generic file preview');
      setFilePreview('file-preview');
    }
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true);

      try {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError.message);
        }

        // Upload and parse resume
        const parseResult = await resumeService.uploadAndParse(file);
        setParsedResume(parseResult.summary);
        console.log('Parsed Resume:', parseResult.summary);

        // Get current user
        const user = await authService.getCurrentUser();
        const userID = user?.id;

        if (!userID) {
          throw new Error('User not authenticated');
        }

        console.log('Current User ID:', userID);

        // Check if resume exists
        const existingResume = await resumeService.getResume(userID);

        if (existingResume) {
          // Update existing resume
          await resumeService.updateResume(userID, parseResult.summary);
          console.log('Resume updated successfully');
        } else {
          // Create new resume
          await resumeService.saveResume(userID, parseResult.summary);
          console.log('Resume created successfully');
        }

        setSelectedFile(file);
        createFilePreview(file);
      } catch (err) {
        console.error('Error uploading resume:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to process your resume.';
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [resumeService, authService, createFilePreview]
  );

  const removeFile = useCallback(() => {
    if (filePreview && filePreview.startsWith('pdf:')) {
      const objectUrl = filePreview.substring(4);
      URL.revokeObjectURL(objectUrl);
    }
    setSelectedFile(null);
    setFilePreview(null);
  }, [filePreview]);

  return {
    selectedFile,
    filePreview,
    parsedResume,
    loading,
    uploadFile,
    removeFile,
    formatFileSize: formatFileSize,
  };
}
