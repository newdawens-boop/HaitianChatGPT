export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  createdAt?: string;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
  project?: {
    id: string;
    title: string;
    description: string;
    status: 'generating' | 'ready';
  };
  generatedImage?: {
    url: string;
    prompt: string;
  };
  generatedFile?: {
    name: string;
    content: string;
    type: string;
  };
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}
