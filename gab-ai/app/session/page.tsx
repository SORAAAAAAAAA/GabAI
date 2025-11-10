'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Logout from '@/components/logout';
import { uploadResume } from '@/utils/api/api.uploadResume';
import { startSession } from '@/utils/api/api.startSession';
import { createClient } from '@/lib/supabase/supabaseClient';
import { UUID } from 'crypto';


export default function SessionPage() {
  const router = useRouter();
  const [jobRole, setJobRole] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedResume, setParsedResume] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const createFilePreview = (file: File) => {
    console.log('Creating preview for file:', file.type, file.name);
    
    const reader = new FileReader();
    
    if (file.type.startsWith('image/')) {
      // For images, create data URL for thumbnail
      reader.onload = (e) => {
        console.log('Image preview loaded');
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // For PDFs, create object URL for iframe preview
      console.log('Creating PDF object URL');
      const objectUrl = URL.createObjectURL(file);
      setFilePreview(`pdf:${objectUrl}`);
    } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt') || 
               file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.csv')) {
      // For text files, read actual content
      console.log('Reading text file content');
      reader.onload = (e) => {
        const textContent = e.target?.result as string;
        setFilePreview(`text:${textContent}`);
      };
      reader.readAsText(file);
    } else if (file.type.includes('word') || file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) {
      // For Word documents, we'll show a document-specific preview
      console.log('Setting Word document preview');
      setFilePreview('doc-preview');
    } else {
      // For other file types, show a generic file preview
      console.log('Setting generic file preview');
      setFilePreview('file-preview');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      createFilePreview(file);
      console.log('File dropped:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    try {
      const supabase = createClient();
      const resume = await uploadResume(file);
      setParsedResume(resume);
      console.log('Parsed Resume:', resume);

      const {data} = await supabase.auth.getSession();
      // Save parsed resume to Supabase
      const userID = data.session?.user?.id;
      console.log('Current User ID:', userID);

      const resumeDBUserID = await supabase.from('resumes').select('id').eq('user_id', userID).single();
      console.log('Existing Resume Check:', resumeDBUserID.data?.id);
      if (resumeDBUserID?.data?.id) {
        // If resume already exists, update it
        const {data, error} = await supabase.from('resumes').update(
          {
            resume_text: resume,
          }
        ).eq('id', resumeDBUserID.data.id);
        if (error) {
          console.error('Resume update error:', error);
          throw error;
        }
        console.log('Resume updated successfully:', data);
      } else {
      // Save resume to Supabase
      const { data, error } = await supabase.from('resumes').insert([
      {
        user_id: userID,
        resume_text: resume,
      },
      ]);
      if (error) {
        console.error('Resume insert error:', error);
        throw error;
      }
      console.log('Resume uploaded and saved successfully:', data);
    }
    setSelectedFile(file);
    createFilePreview(file);
    } catch (err) {
      console.error('Error uploading resume:', err);
      alert('Failed to process your resume.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    // Clean up object URLs to prevent memory leaks
    if (filePreview && filePreview.startsWith('pdf:')) {
      const objectUrl = filePreview.substring(4);
      URL.revokeObjectURL(objectUrl);
    }
    setSelectedFile(null);
    setFilePreview(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return '📄';
    }
  };

  const handleStartSession = async () => {
    if (!jobRole.trim()) {
      alert('Please enter your desired job role first.');
      return;
    }
    try {
      const supabase = createClient();
      setSessionStart(true);
      const {data} = await supabase.auth.getUser();
      const userID = (data.user?.id) as UUID;
      console.log('[handleStartSession] User ID:', userID);
      console.log('[handleStartSession] Job Role:', jobRole);
      console.log('[handleStartSession] Parsed Resume length:', parsedResume.length);

      const job = jobRole.trim();

      // startSession() already returns the parsed JSON data
      const responseData = await startSession(userID, job, parsedResume);
      console.log('[handleStartSession] Success Response:', responseData);
      const { sessionId, wsURL } = responseData;
      console.log('[handleStartSession] Session ID:', sessionId);
      console.log('[handleStartSession] WebSocket URL:', wsURL);

      setSessionStart(false);
      // Redirect to chatbot page
      router.push(`/session/chatbot?sessionId=${sessionId}&wsURL=${encodeURIComponent(wsURL)}`);
    } catch (error) {
      console.error('[handleStartSession] Error:', error);
      setSessionStart(false);
      alert('Failed to start session. Please try again.');
    }
  };

  return (
    <div className="flex h-full">
      
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Your journey to landing your dream job starts here.
            </h1>
          </div>
          
          <Logout />
        </div>

        {/* Main Content */}
        <div className="flex space-x-8 h-full max-h-[calc(100vh-200px)]">
          
          {/* Interview Preparation Section */}
          <div className={`bg-white rounded-lg p-6 shadow-sm w-1/2 ${sessionStart ? 'opacity-50 pointer-events-none' : ''}`}>
            {sessionStart && (
              <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg">
                <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-700 font-medium">Starting your interview session...</p>
                </div>
              </div>
            )}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Get Ready for Your Interview</h2>
              <p className="text-gray-500 mb-6 text-sm">
                Tell us about the role you&apos;re aiming for. This will help tailor the interview questions to your field.
              </p>
              
              <div className="mb-6">
                <label className="block text-gray-900 text-sm font-medium mb-2">
                  Desired Job Role
                </label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Marketing"
                  className="w-full px-4 py-3 rounded-lg text-gray-700 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={sessionStart}
                />
              </div>

              <button
                onClick={handleStartSession}
                disabled={sessionStart}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sessionStart ? 'Starting Session...' : 'Start Interview Session'}
              </button>
              
              <p className="text-gray-500 text-xs text-center">
                Simulate real interview scenarios and receive instant feedback on your answers.
              </p>
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="w-1/2">
            <div className="bg-white rounded-lg shadow-sm h-full relative">
              {loading && (
                <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center z-10">
                  <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-700 font-medium">Processing your resume...</p>
                  </div>
                </div>
              )}
              <div
                className={`border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  // File Preview - Full Container
                  <div className="w-full h-full flex flex-col">
                    {/* Main Preview Area */}
                    <div className="flex-1 p-4 overflow-hidden">
                      {filePreview ? (
                        <>
                          {filePreview.startsWith('data:image') ? (
                            // Image Preview - Full Size
                            <div className="w-full h-full flex items-center justify-center">
                              <Image 
                                src={filePreview} 
                                alt="File preview" 
                                width={400}
                                height={300}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                style={{ width: 'auto', height: 'auto' }}
                              />
                            </div>
                          ) : filePreview.startsWith('pdf:') ? (
                            // PDF Content Preview - Full Size
                            <div className="w-full h-full">
                              <iframe
                                src={filePreview.substring(4)}
                                width="100%"
                                height="100%"
                                className="rounded-lg border border-gray-200"
                                title="PDF Preview"
                              />
                            </div>
                          ) : filePreview.startsWith('text:') ? (
                            // Text Content Preview - Full Size
                            <div className="w-full h-full">
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-full overflow-auto">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                                  {filePreview.substring(5)}
                                </pre>
                              </div>
                            </div>
                          ) : filePreview === 'doc-preview' ? (
                            // Word Document Preview - Centered
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
                                <div className="text-8xl mb-4">📝</div>
                                <div className="text-xl text-blue-600 font-semibold mb-2">Word Document</div>
                                <div className="text-gray-600">{selectedFile.name}</div>
                                <div className="text-sm text-gray-500 mt-2">{formatFileSize(selectedFile.size)}</div>
                              </div>
                            </div>
                          ) : (
                            // Generic File Preview - Centered
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
                                <div className="text-8xl mb-4">{getFileIcon(selectedFile)}</div>
                                <div className="text-xl text-gray-600 font-semibold mb-2">Document</div>
                                <div className="text-gray-600">{selectedFile.name}</div>
                                <div className="text-sm text-gray-500 mt-2">{formatFileSize(selectedFile.size)}</div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        // Fallback - Centered
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-8xl mb-4">
                              {getFileIcon(selectedFile)}
                            </div>
                            <div className="text-xl text-gray-600 font-medium">{selectedFile.name}</div>
                            <div className="text-sm text-gray-500 mt-2">{formatFileSize(selectedFile.size)}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <svg 
                            className="w-6 h-6 text-green-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              File Uploaded Successfully
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedFile.name} • {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeFile}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={removeFile}
                        className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-2 px-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Upload Different File
                      </button>
                    </div>
                  </div>
                ) : (
                  // Upload Prompt
                  <div className="text-center p-8">
                    <div className="mb-6">
                      <svg 
                        className="w-16 h-16 text-gray-400 mx-auto mb-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                        />
                      </svg>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drop your Resume/CV here
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-6">
                      or click to browse files
                    </p>
                    
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.json,.csv,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,text/*"
                      onChange={handleFileInput}
                      disabled={loading}
                    />
                    <label
                      htmlFor="resume-upload"
                      className={`inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </div>
                      ) : (
                        'Browse Files'
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}