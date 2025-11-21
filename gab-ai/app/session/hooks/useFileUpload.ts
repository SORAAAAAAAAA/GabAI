import { useState } from 'react';
import { uploadResume } from '@/utils/api/api.uploadResume';
import { createClient } from '@/lib/supabase/supabaseClient';


interface UseFileUploadReturn {
  selectedFile: File | null;
  filePreview: string | null;
  parsedResume: string | null;
  loading: boolean;
  uploadFile: (file: File) => Promise<void>;
  removeFile: () => void;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (file: File) => string | undefined;
}

export function useFileUpload(): UseFileUploadReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedResume, setParsedResume] = useState<string | null>(null);
  
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

      const uploadFile = async (file: File) => {
          setLoading(true);
          if (!file) return;
      
          try {
            const supabase = createClient();
            const { summary } = await uploadResume(file);
            const resumeText = summary; 
            setParsedResume(resumeText);
            console.log('Parsed Resume Text:', resumeText);
            
            const {data} = await supabase.auth.getSession();
            // Save parsed resume to Supabase
            const userID = data.session?.user?.id;
            console.log('Current User ID:', userID);

            if (resumeText && resumeText.toLowerCase() === 'not a resume') {
              console.log('Uploaded document is not a resume/CV.');
              throw new Error('Uploaded document is not recognized as a resume/CV.');
            }
      
            const resumeDBUserID = await supabase.from('resumes').select('id').eq('user_id', userID).single();
            console.log('Existing Resume Check:', resumeDBUserID.data?.id);
            if (resumeDBUserID?.data?.id) {
              // If resume already exists, update it
              const {data, error} = await supabase.from('resumes').update(
                {
                  resume_text: resumeText,
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
              resume_text: resumeText,
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
            alert(err instanceof Error ? err.message : String(err));
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

        return { selectedFile, filePreview, parsedResume, loading, uploadFile, removeFile, formatFileSize, getFileIcon }
}