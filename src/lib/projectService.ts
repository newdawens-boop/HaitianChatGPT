import { supabase } from './supabase';
import { Project, ProjectFile } from '@/types/project';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('file_path', { ascending: true });

    if (error) throw error;
    return data?.map(f => ({
      path: f.file_path,
      content: f.file_content,
      language: f.language,
    })) || [];
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  downloadAsZip(project: Project, files: ProjectFile[]): void {
    // For single HTML files
    if (files.length === 1 && files[0].path.endsWith('.html')) {
      const blob = new Blob([files[0].content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files[0].path;
      a.click();
      return;
    }

    // For multi-file projects, create a simple text bundle
    // In a real implementation, use JSZip library
    const bundleContent = files.map(f => 
      `// ========== ${f.path} ==========\n\n${f.content}\n\n`
    ).join('\n');

    const blob = new Blob([bundleContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-')}-bundle.txt`;
    a.click();
  },

  async publishToGitHub(project: Project, files: ProjectFile[]): Promise<string> {
    // This would require GitHub OAuth and API integration
    // For now, return a message
    throw new Error('GitHub publishing requires authentication. Please connect your GitHub account in settings.');
  },
};
