import React from 'react';
import { useFileUpload } from '@/app/session/hooks/useFileUpload';
import SessionLoader from '@/app/session/components/SessionLoader';
import FilePreview from '@/app/session/components/FilePreview';


export default function ResumeUpload() {
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
    <div className="w-1/2 h-full flex flex-col">
      <div className="bg-white rounded-xl shadow-lg h-full relative flex flex-col border border-gray-100">
        {loading && <SessionLoader message="Processing your resume..." />}
        
        <div
          className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 h-full flex flex-col items-center justify-center rounded-xl"
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
          }}
        >
          {selectedFile ? (
            <FilePreview
              file={selectedFile} 
              preview={filePreview} 
              onRemove={removeFile} 
            />
          ) : (
            <div className="text-center p-12 w-full">
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                onChange={handleFileInput}
              />
              <label htmlFor="resume-upload" className="cursor-pointer block">
                <div className="flex flex-col items-center gap-4">
                  {/* Upload Icon */}
                  <div className="bg-blue-100 p-4 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  
                  {/* Text Content */}
                  <div>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      Upload Your Resume
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Drag and drop your PDF here or click to browse
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        PDF
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Or start interview to use previous
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}



