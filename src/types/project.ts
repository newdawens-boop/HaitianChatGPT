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
// DATABASE TYPES
// =======================

export interface DBProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  project_type: string;
  status: 'generating' | 'ready' | 'error';
  model: string;
  github_repo: string | null;
  github_url: string | null;
  publish_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  file_content: string;
  language: string | null;
  created_at: string;
}

// =======================
// PROJECT (Client-side)
// =======================

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'generating' | 'ready' | 'error';
  model: string; // AIModel.id
  files?: ProjectFile[];
  createdAt: string;
  updatedAt: string;
  githubRepo?: string;
  githubUrl?: string;
  publishUrl?: string;
  projectType?: string;
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

// =======================
// LEGACY TYPES (For compatibility)
// =======================

export interface LegacyProject {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'generating' | 'ready' | 'building' | 'deployed' | 'error';
  createdAt: Date;
  updatedAt: Date;
  previewUrl?: string;
  githubUrl?: string;
  deployUrl?: string;
}
