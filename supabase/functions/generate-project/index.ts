import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Configuration
const CONFIG = {
  MAX_FILE_SIZE: 500 * 1024, // 500KB per file
  MAX_TOTAL_SIZE: 5 * 1024 * 1024, // 5MB total
  MAX_FILES: 50,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 5,
  ALLOWED_PROJECT_TYPES: ['react', 'vue', 'svelte', 'nextjs', 'nuxt', 'node', 'python', 'html', 'typescript', 'javascript'],
  BLOCKED_PATHS: ['../', '..\\', '/etc/', '/root/', '/home/', 'C:\\', '\\', '\x00', '.env', '.ssh', '.git'],
  ALLOWED_LANGUAGES: ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'markdown', 'sql', 'yaml', 'dockerfile', 'text', 'jsx', 'tsx', 'vue', 'svelte'],
};

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Security: Input sanitization
function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}

// Security: Validate file path
function isValidFilePath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  if (path.length > 500) return false;
  
  // Check for path traversal attacks
  if (CONFIG.BLOCKED_PATHS.some(blocked => path.toLowerCase().includes(blocked.toLowerCase()))) {
    return false;
  }
  
  // Must be relative path
  if (path.startsWith('/') && !path.startsWith('./')) return false;
  
  // Valid characters only
  return /^[a-zA-Z0-9_\/.\-@]+$/.test(path);
}

// Security: Validate language
function isValidLanguage(lang: string): boolean {
  if (!lang || typeof lang !== 'string') return false;
  return CONFIG.ALLOWED_LANGUAGES.includes(lang.toLowerCase());
}

// Rate limiting check
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + CONFIG.RATE_LIMIT_WINDOW,
    });
    return true;
  }
  
  if (userLimit.count >= CONFIG.MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Chunk large files for database storage
function chunkFile(content: string, filePath: string, projectId: string, language: string) {
  const chunks: { project_id: string; file_path: string; chunk_index: number; chunk_content: string; language: string; total_chunks: number; is_large_file: boolean }[] = [];
  const contentSize = new TextEncoder().encode(content).length;
  
  if (contentSize <= CONFIG.MAX_FILE_SIZE) {
    return [{
      project_id: projectId,
      file_path: filePath,
      chunk_index: 0,
      chunk_content: content,
      language: language,
      total_chunks: 1,
      is_large_file: false,
    }];
  }
  
  // Split into chunks
  const chunkSize = CONFIG.MAX_FILE_SIZE;
  let index = 0;
  let remaining = content;
  
  while (remaining.length > 0) {
    // Find safe split point (at newline if possible)
    let splitPoint = Math.min(chunkSize, remaining.length);
    if (splitPoint < remaining.length) {
      const lastNewline = remaining.lastIndexOf('\n', splitPoint);
      if (lastNewline > splitPoint * 0.8) {
        splitPoint = lastNewline + 1;
      }
    }
    
    chunks.push({
      project_id: projectId,
      file_path: filePath,
      chunk_index: index,
      chunk_content: remaining.slice(0, splitPoint),
      language: language,
      total_chunks: Math.ceil(contentSize / chunkSize),
      is_large_file: true,
    });
    
    remaining = remaining.slice(splitPoint);
    index++;
  }
  
  return chunks;
}

// Validate project data structure
function validateProjectData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid project data structure' };
  }
  
  if (!Array.isArray(data.files)) {
    return { valid: false, error: 'Files must be an array' };
  }
  
  if (data.files.length === 0) {
    return { valid: false, error: 'No files provided' };
  }
  
  if (data.files.length > CONFIG.MAX_FILES) {
    return { valid: false, error: `Too many files. Maximum is ${CONFIG.MAX_FILES}` };
  }
  
  let totalSize = 0;
  
  for (const file of data.files) {
    if (!file.path || !file.content) {
      return { valid: false, error: 'Each file must have path and content' };
    }
    
    if (!isValidFilePath(file.path)) {
      return { valid: false, error: `Invalid file path: ${file.path}` };
    }
    
    const contentSize = new TextEncoder().encode(file.content).length;
    totalSize += contentSize;
    
    if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
      return { valid: false, error: `Total project size exceeds ${CONFIG.MAX_TOTAL_SIZE / 1024 / 1024}MB` };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing authorization token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      });
    }

    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { projectType, description, title } = body;

    // Validate required fields
    if (!projectType || !description) {
      return new Response(JSON.stringify({ error: 'Missing required fields: projectType, description' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs
    const sanitizedProjectType = sanitizeInput(projectType, 50).toLowerCase();
    const sanitizedDescription = sanitizeInput(description, 1000);
    const sanitizedTitle = sanitizeInput(title, 200) || `${sanitizedProjectType} Project`;

    // Validate project type
    if (!CONFIG.ALLOWED_PROJECT_TYPES.includes(sanitizedProjectType)) {
      return new Response(JSON.stringify({ 
        error: `Invalid project type. Allowed: ${CONFIG.ALLOWED_PROJECT_TYPES.join(', ')}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating project:', { projectType: sanitizedProjectType, title: sanitizedTitle, userId: user.id });

    // Create project record with transaction safety
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        user_id: user.id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        project_type: sanitizedProjectType,
        status: 'generating',
        model: 'gemini-3-flash-preview',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return new Response(JSON.stringify({ error: 'Failed to create project' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Project created:', project.id);

    // Get AI configuration
    const aiBaseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');
    const aiApiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    
    if (!aiBaseUrl || !aiApiKey) {
      // Update project to failed status
      await supabaseClient
        .from('projects')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', project.id);
        
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate project using AI
    const systemPrompt = `You are an expert software engineer. Generate a complete, production-ready ${sanitizedProjectType} project.

CRITICAL REQUIREMENTS:
1. Generate ALL necessary files for a complete, working project
2. Include package.json (or equivalent) with all dependencies
3. Use modern best practices and latest stable syntax
4. Generate real, functional code - NO placeholders, TODOs, or "implement this" comments
5. Include proper file structure with appropriate folders
6. Add helpful comments explaining complex logic
7. Ensure code is production-ready and follows security best practices
8. Maximum 50 files, keep files under 500KB each

SECURITY RULES:
- No hardcoded secrets or API keys
- No malicious code
- Proper input validation in generated code
- Safe defaults

Return ONLY valid JSON in this exact format:
{
  "files": [
    {
      "path": "src/components/Button.tsx",
      "content": "import React...",
      "language": "typescript"
    }
  ],
  "explanation": "Brief explanation of the project structure and how to run it"
}`;

    const userPrompt = `Create a ${sanitizedProjectType} project: ${sanitizedDescription}

Requirements:
- Must be production-ready and fully functional
- Include all necessary configuration files
- Follow ${sanitizedProjectType} best practices
- Ensure code quality and security`;

    // Call AI with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    let aiResponse;
    try {
      aiResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 8000,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('AI generation timed out after 60 seconds');
      }
      throw error;
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('Empty response from AI');
    }

    console.log('AI response received, length:', aiContent.length);

    // Parse JSON from AI response with multiple fallback strategies
    let projectData;
    const parseErrors = [];
    
    // Strategy 1: Direct JSON parse
    try {
      projectData = JSON.parse(aiContent);
    } catch (e) {
      parseErrors.push('Direct parse failed');
    }
    
    // Strategy 2: Extract from markdown code block
    if (!projectData) {
      try {
        const jsonMatch = aiContent.match(/```(?:json)?\n?([\s\S]*?)```/);
        if (jsonMatch) {
          projectData = JSON.parse(jsonMatch[1].trim());
        }
      } catch (e) {
        parseErrors.push('Code block parse failed');
      }
    }
    
    // Strategy 3: Find JSON object boundaries
    if (!projectData) {
      try {
        const startIdx = aiContent.indexOf('{');
        const endIdx = aiContent.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          projectData = JSON.parse(aiContent.slice(startIdx, endIdx + 1));
        }
      } catch (e) {
        parseErrors.push('Boundary parse failed');
      }
    }

    // Validate parsed data
    const validation = validateProjectData(projectData);
    if (!validation.valid) {
      console.error('Validation failed:', validation.error, 'Parse errors:', parseErrors);
      
      // Fallback: Create simple HTML project with the raw content
      projectData = {
        files: [{
          path: 'index.html',
          content: `<!DOCTYPE html>
<html>
<head>
  <title>${sanitizedTitle}</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    pre { background: #f4f4f4; padding: 20px; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${sanitizedTitle}</h1>
  <p>${sanitizedDescription}</p>
  <h2>Generated Content:</h2>
  <pre>${aiContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`,
          language: 'html'
        }],
        explanation: 'Project generated with fallback template due to parsing issues'
      };
    }

    // Process and store files with chunking support
    const allChunks: any[] = [];
    const fileMetadata: { path: string; language: string; size: number; chunks: number }[] = [];
    
    for (const file of projectData.files) {
      const filePath = sanitizeInput(file.path, 500);
      const language = isValidLanguage(file.language) ? file.language.toLowerCase() : 'text';
      
      if (!isValidFilePath(filePath)) {
        console.warn('Skipping invalid file path:', filePath);
        continue;
      }
      
      const chunks = chunkFile(file.content, filePath, project.id, language);
      allChunks.push(...chunks);
      
      fileMetadata.push({
        path: filePath,
        language,
        size: new TextEncoder().encode(file.content).length,
        chunks: chunks.length,
      });
    }

    if (allChunks.length === 0) {
      throw new Error('No valid files to store');
    }

    // Store chunks in batches to avoid overwhelming the DB
    const BATCH_SIZE = 10;
    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE);
      const { error: filesError } = await supabaseClient
        .from('project_files')
        .insert(batch);

      if (filesError) {
        console.error('Files insertion error:', filesError);
        throw new Error('Failed to store project files');
      }
    }

    // Update project status
    const { error: updateError } = await supabaseClient
      .from('projects')
      .update({ 
        status: 'ready',
        description: projectData.explanation || sanitizedDescription,
        file_count: fileMetadata.length,
        total_size: fileMetadata.reduce((sum, f) => sum + f.size, 0),
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id);

    if (updateError) {
      console.error('Project update error:', updateError);
    }

    console.log('Project generation complete:', project.id, 'Files:', fileMetadata.length);

    return new Response(JSON.stringify({ 
      success: true,
      project: {
        id: project.id,
        title: project.title,
        status: 'ready',
        fileCount: fileMetadata.length,
      },
      files: fileMetadata,
      explanation: projectData.explanation,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});