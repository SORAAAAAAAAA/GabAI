import React from 'react';

interface FilePreviewProps {
    file: File;
    preview?: string | null;
    onRemove: () => void;
}

export default function FilePreview({ file, preview, onRemove }: FilePreviewProps) {
    const isPdfPreview = preview?.startsWith('pdf:');
    const isTextPreview = preview?.startsWith('text:');
    const pdfUrl = isPdfPreview ? preview?.substring(4) : null;  // Remove 'pdf:' prefix
    const textContent = isTextPreview ? preview?.substring(5) : null;  // Remove 'text:' prefix

    return (
        <div className="p-6 w-full h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button onClick={onRemove} className="text-red-600 hover:text-red-800">Remove</button>
            </div>
            <div className="flex-1 overflow-hidden">   
                {isPdfPreview && pdfUrl && (
                    <iframe 
                        src={pdfUrl} 
                        className="w-full h-64 border rounded h-full"
                        title="PDF Preview"
                    />
                )}

                {isTextPreview && textContent && (
                    <div className="border rounded p-4 bg-gray-50 max-h-64 overflow-y-auto text-sm whitespace-pre-wrap">
                        {textContent}
                    </div>
                )}
                
                {!isPdfPreview && !isTextPreview && preview && (
                    <div className="border rounded p-4 bg-gray-50 text-center text-gray-500">
                        File preview unavailable
                    </div>
                )}
            </div>
        </div>
    );
}