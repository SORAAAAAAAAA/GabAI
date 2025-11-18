/**
 * Resume Service Interface and Implementation
 * Single Responsibility: Only handles resume-related operations
 * Dependency Inversion: Depends on ISupabaseClient interface
 */

import { Resume, UploadResumeResponse } from '@/src/shared/types';
import { ISupabaseClient } from '@/src/infrastructure/supabase/client';
import { API_ENDPOINTS } from '@/src/shared/constants';

/**
 * Interface for Resume operations
 * Allows multiple implementations and easy testing
 */
export interface IResumeService {
  uploadAndParse(file: File): Promise<UploadResumeResponse>;
  saveResume(userId: string, resumeText: string): Promise<Resume>;
  getResume(userId: string): Promise<Resume | null>;
  updateResume(userId: string, resumeText: string): Promise<Resume>;
}

/**
 * Concrete implementation of resume service
 */
export class ResumeService implements IResumeService {
  constructor(private supabase: ISupabaseClient) {}

  async uploadAndParse(file: File): Promise<UploadResumeResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(API_ENDPOINTS.RESUME.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Resume upload failed: ${errorText}`);
      }

      return res.json();
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }

  async saveResume(userId: string, resumeText: string): Promise<Resume> {
    try {
      const { data, error } = await this.supabase
        .from('resumes')
        .insert([
          {
            user_id: userId,
            resume_text: resumeText,
          },
        ])
        .select('*')
        .single();

      if (error) throw error;

      return data as Resume;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  }

  async getResume(userId: string): Promise<Resume | null> {
    try {
      const { data, error } = await this.supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows found" - this is expected sometimes
        throw error;
      }

      return data ? (data as Resume) : null;
    } catch (error) {
      console.error('Error getting resume:', error);
      return null;
    }
  }

  async updateResume(userId: string, resumeText: string): Promise<Resume> {
    try {
      const { data, error } = await this.supabase
        .from('resumes')
        .update({ resume_text: resumeText })
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) throw error;

      return data as Resume;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }
}
