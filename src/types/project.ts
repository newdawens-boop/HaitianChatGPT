export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'react' | 'nextjs' | 'vite' | 'html' | 'ios' | 'android';
  status: 'creating' | 'ready' | 'building' | 'deployed' | 'error';
  createdAt: Date;
  updatedAt: Date;
  previewUrl?: string;
  githubUrl?: string;
  deployUrl?: string;
  customDomain?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: ProjectFile[];
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'pro';
  icon: string;
}

export interface DeploymentLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}
