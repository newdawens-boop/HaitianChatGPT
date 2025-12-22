export interface ProjectFile {
  path: string;
  content: string;
  language?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'generating' | 'ready' | 'error';
  model: string;
  files: ProjectFile[];
  createdAt: string;
  githubRepo?: string;
  publishUrl?: string;
}

export interface ProjectState {
  projects: Map<string, Project>;
  currentProjectId: string | null;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setCurrentProjectId: (id: string | null) => void;
  getProject: (id: string) => Project | undefined;
}
