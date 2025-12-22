import { supabase } from './supabase';

export class FileUploadService {
  async uploadFile(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('File upload failed:', error);
      return null;
    }
  }

  async uploadMultipleFiles(files: File[], userId: string): Promise<Array<{ url: string; name: string; type: string }>> {
    const results = await Promise.all(
      files.map(async (file) => {
        const url = await this.uploadFile(file, userId);
        return url ? { url, name: file.name, type: file.type } : null;
      })
    );

    return results.filter((result): result is { url: string; name: string; type: string } => result !== null);
  }

  async deleteFile(url: string): Promise<boolean> {
    try {
      // Extract path from URL
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/chat-attachments\/(.+)$/);
      
      if (!pathMatch) return false;
      
      const filePath = pathMatch[1];
      
      const { error } = await supabase.storage
        .from('chat-attachments')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('File deletion failed:', error);
      return false;
    }
  }
}

export const fileUploadService = new FileUploadService();
