import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { projectType, description, title } = await req.json();

    console.log('Generating project:', { projectType, description, title });

    // Create project record
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        user_id: user.id,
        title: title || `${projectType} Project`,
        description: description || `A new ${projectType} project`,
        project_type: projectType,
        status: 'generating',
        model: 'sonnet-4.5',
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return new Response(JSON.stringify({ error: projectError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Project created:', project.id);

    // Generate project using OnSpace AI
    const systemPrompt = `You are an expert software engineer. Generate a complete, production-ready ${projectType} project based on the user's description.

CRITICAL REQUIREMENTS:
1. Generate ALL necessary files for a complete project
2. Include package.json, configuration files, and dependencies
3. Use modern best practices and latest syntax
4. Generate real, functional code - NO placeholders or TODOs
5. Include proper file structure with folders
6. Add comments explaining key parts
7. Make it production-ready and deployable

Return your response in this EXACT JSON format:
{
  "files": [
    {
      "path": "package.json",
      "content": "...",
      "language": "json"
    },
    {
      "path": "src/index.js",
      "content": "...",
      "language": "javascript"
    }
  ],
  "explanation": "Brief explanation of what was built and how to use it"
}`;

    const userPrompt = `Create a ${projectType} project: ${description}

Requirements:
- Project type: ${projectType}
- Must be production-ready
- Include all necessary files and dependencies
- Use modern best practices`;

    const aiResponse = await fetch(`${Deno.env.get('ONSPACE_AI_BASE_URL')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('ONSPACE_AI_API_KEY')}`,
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
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    console.log('AI response received');

    // Parse JSON from AI response
    let projectData;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || 
                       aiContent.match(/```\n([\s\S]*?)\n```/) ||
                       [null, aiContent];
      projectData = JSON.parse(jsonMatch[1] || aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: Create a simple single-file project
      projectData = {
        files: [{
          path: 'index.html',
          content: aiContent,
          language: 'html'
        }],
        explanation: 'Generated project'
      };
    }

    // Store files in database
    const fileInserts = projectData.files.map((file: any) => ({
      project_id: project.id,
      file_path: file.path,
      file_content: file.content,
      language: file.language || 'text',
    }));

    const { error: filesError } = await supabaseClient
      .from('project_files')
      .insert(fileInserts);

    if (filesError) {
      console.error('Files insertion error:', filesError);
      throw filesError;
    }

    // Update project status
    await supabaseClient
      .from('projects')
      .update({ 
        status: 'ready',
        description: projectData.explanation || description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id);

    console.log('Project generation complete:', project.id);

    return new Response(JSON.stringify({ 
      project,
      files: projectData.files,
      explanation: projectData.explanation,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
