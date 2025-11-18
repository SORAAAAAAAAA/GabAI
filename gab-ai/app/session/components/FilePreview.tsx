import React from 'react';

interface FilePreviewProps {
    file: File;
    preview?: string | null;
    onRemove: () => void;
}

export default function FilePreview({ file, preview, onRemove }: FilePreviewProps) {
    const isPdfPreview = preview?.startsWith('pdf:');
    const isTextPreview = preview?.startsWith('text:');
    const pdfUrl = isPdfPreview ? preview?.substring(4) : null;
    const textContent = isTextPreview ? preview?.substring(5) : null;

    return (
        <div className="p-8 w-full h-full flex flex-col bg-gray-50">
            {/* Header with File Info */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
                <button 
                    onClick={onRemove} 
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 hover:text-red-700 transition-all duration-200"
                    title="Remove file"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            {/* Preview Container */}
            <div className="flex-1 overflow-hidden rounded-xl bg-white border border-gray-200">
                {isPdfPreview && pdfUrl && (
                    <iframe 
                        src={pdfUrl} 
                        className="w-full h-full border-none"
                        title="PDF Preview"
                    />
                )}

                {isTextPreview && textContent && (
                    <div className="w-full h-full p-6 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50">
                        {textContent}
                    </div>
                )}
                
                {!isPdfPreview && !isTextPreview && preview && (
                    <div className="w-full h-full flex items-center justify-center text-center">
                        <div>
                            <p className="text-gray-500">File preview unavailable</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}