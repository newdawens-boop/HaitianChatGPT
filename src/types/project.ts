// types/project.ts

// =======================
// AI MODELS
// =======================

export type ModelTier = 'free' | 'pro';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  tier: ModelTier;
  logo: any; // ImageSourcePropType (React Native / Expo)
}

// =======================
// PROJECT FILES
// =======================

export interface ProjectFile {
  path: string;
  content: string;
  language?: string;
}

// =======================
// PROJECT
// =======================

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'generating' | 'ready' | 'error';
  model: string; // AIModel.id
  files: ProjectFile[];
  createdAt: string;
  githubRepo?: string;
  publishUrl?: string;
}

// =======================
// PROJECT STATE (STORE)
// =======================

export interface ProjectState {
  projects: Map<string, Project>;
  currentProjectId: string | null;

  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setCurrentProjectId: (id: string | null) => void;
  getProject: (id: string) => Project | undefined;
}
