import React from 'react';
import { useFileUpload } from '@/app/session/hooks/useFileUpload';
import SessionLoader from '@/app/session/components/SessionLoader';
import FilePreview from '@/app/session/components/FilePreview';

interface ResumeUploadProps {
    onFileUploaded: (resumeText: string) => void;
}


export default function ResumeUpload({ onFileUploaded }: ResumeUploadProps) {
    const { selectedFile, filePreview, loading, uploadFile, removeFile } = useFileUpload();

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadFile(file);
            
        } catch (error) {
            alert('Failed to upload file. Please try again.');
            console.log('Upload error:', error);
        }

    }

    const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

    return (
    <div className="w-1/2">
      <div className="bg-white rounded-lg shadow-sm h-full relative">
        {loading && <SessionLoader message="Processing your resume..." />}
        
        <div
          className="border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {selectedFile ? (
            <FilePreview
              file={selectedFile} 
              preview={filePreview} 
              onRemove={removeFile} 
            />
          ) : (
            <div className="text-center p-8">
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="text-gray-500 border-2 border-dashed border-gray-300 p-6 rounded-lg"> 
              <label htmlFor="resume-upload" className="cursor-pointer hover:text-blue-800">
                Drop your Resume/CV here or click to browse
              </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}



