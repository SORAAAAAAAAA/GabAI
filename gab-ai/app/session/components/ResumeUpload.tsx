"use client";
 
import React from "react";
import { useFileUpload } from "@/app/session/hooks/useFileUpload";
import ResumeLoader from "@/app/session/components/ResumeLoader";
import FilePreview from "@/app/session/components/FilePreview";
import { Plus } from "lucide-react";

export default function ResumeUpload() {
  const { selectedFile, filePreview, loading, uploadFile, removeFile } =
    useFileUpload();

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isValidType = file.type === 'application/pdf' || 
                       file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                       file.type === 'application/msword' ||
                       fileName.endsWith('.pdf') ||
                       fileName.endsWith('.docx') ||
                       fileName.endsWith('.doc');

    if (!isValidType) {
      alert('Please upload a PDF or Word document (DOCX/DOC).');
      e.target.value = ''; // Clear input
      return;
    }

    try {
      await uploadFile(file);
    } catch (error) {
      alert("Failed to upload file. Please try again.");
      console.log("Upload error:", error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isValidType = file.type === 'application/pdf' || 
                       file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                       file.type === 'application/msword' ||
                       fileName.endsWith('.pdf') ||
                       fileName.endsWith('.docx') ||
                       fileName.endsWith('.doc');

    if (!isValidType) {
      alert('Please upload a PDF or Word document (DOCX/DOC).');
      return;
    }

    uploadFile(file);
  };

  return (
    <div className="flex-1 h-full flex flex-col">
      <div className="bg-white rounded-xl shadow-sm relative h-full flex flex-col">

        {loading && <ResumeLoader message="Processing your resume..." />}

        {/* Upload Box */}
        <div
          className={`
            h-full flex-1 flex flex-col items-center justify-center text-center 
            border-2 border-dashed border-gray-200 rounded-xl 
            transition-all cursor-pointer relative
            hover:bg-gray-50/50 hover:border-gray-300
          `}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-blue-400", "bg-blue-50/40");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/40");
          }}
        >
          {/* Hidden File Input */}
          <input
            type="file"
            id="resume-upload"
            className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${selectedFile ? 'hidden' : 'z-10'}`}
            onChange={handleFileInput}
          />

          {/* If file selected show preview */}
          {selectedFile ? (
            <FilePreview
              file={selectedFile}
              preview={filePreview}
              onRemove={removeFile}
            />
          ) : (
            <div className="pointer-events-none px-6">
              {/* Upload Icon */}
              <div className="w-14 h-14 bg-gray-200 text-black rounded-full flex items-center justify-center mb-5 mx-auto group-hover:scale-110 transition-transform duration-200">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>

              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Upload Your Resume
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                Drag and drop your PDF or Word document here or click to browse
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-200 text-black">
                  PDF
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-200 text-black">
                  DOCX
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                  Or start interview to use previous
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
