import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from JWT token (optional - allow anonymous users)
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    let user = null;
    
    if (token) {
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser(token);
      if (!userError && authUser) {
        user = authUser;
      }
    }

    const { messages, chatId, mode, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect if user wants image generation
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const imageKeywords = ['create logo', 'make logo', 'design logo', 'generate image', 'create image', 'make image', 'draw', 'create a logo', 'make a logo'];
    const wantsImage = mode === 'image' || imageKeywords.some(keyword => lastUserMessage.toLowerCase().includes(keyword));

    // Handle image generation
    if (wantsImage) {
      const imageResponse = await fetch(`${Deno.env.get('ONSPACE_AI_BASE_URL')}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('ONSPACE_AI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.5-vision',
          prompt: lastUserMessage,
          n: 2,
          size: '1024x1024',
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error('Image generation error:', errorText);
        return new Response(
          JSON.stringify({ error: `Image generation failed: ${errorText}` }),
          { status: imageResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const imageData = await imageResponse.json();
      const images = imageData.data || [];

      // Save to database if authenticated
      if (chatId && user) {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await supabaseAdmin.from('messages').insert({
          chat_id: chatId,
          role: 'user',
          content: lastUserMessage,
        });

        await supabaseAdmin.from('messages').insert({
          chat_id: chatId,
          role: 'assistant',
          content: 'Images created',
        });

        await supabaseAdmin
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId);
      }

      return new Response(
        JSON.stringify({ 
          message: 'Images created',
          images: images.map((img: any) => ({
            url: img.url,
            revised_prompt: img.revised_prompt || lastUserMessage,
          })),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Basic spam detection
    const spamPatterns = [
      /(.{1,3})\1{10,}/i, // Repeated characters
      /(https?:\/\/[^\s]+){5,}/gi, // Multiple URLs
      /[A-Z]{20,}/g, // Excessive caps
    ];
    
    if (spamPatterns.some(pattern => pattern.test(lastUserMessage))) {
      return new Response(
        JSON.stringify({ error: 'Message appears to be spam. Please send a normal message.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Specialized AI system prompts
    const SPECIALIZED_AI_PROMPTS: Record<string, string> = {
      'creative-storyteller': `You are a Creative Storyteller AI, specialized in creative writing, storytelling, poetry, and scripts.

Your expertise includes:
- Writing engaging stories (short stories, novels, flash fiction)
- Crafting beautiful poetry (sonnets, haikus, free verse)
- Developing compelling scripts (screenplays, plays, dialogue)
- Creating vivid characters and world-building
- Providing creative writing tips and techniques

Your tone is imaginative, expressive, and inspiring. Help users unleash their creativity and craft compelling narratives.`,
      
      'creative-poet': `You are a Poetry Master, specialized in crafting and analyzing poetry.

Your expertise includes:
- Writing various poetry forms (sonnets, haikus, free verse, limericks)
- Analyzing poetic devices (metaphor, alliteration, rhythm)
- Helping with rhyme schemes and meter
- Creating lyrical and emotional content
- Teaching poetry writing techniques

Your tone is lyrical, thoughtful, and artistic.`,
      
      'professional-assistant': `You are a Professional Assistant AI, specialized in business, education, and coding.

Your expertise includes:
- Business strategy, planning, and analysis
- Professional writing (reports, emails, proposals)
- Educational content and tutoring
- Code development and debugging (Python, JavaScript, etc.)
- Data analysis and problem-solving

Your tone is professional, clear, and solution-oriented. Provide well-structured, actionable advice.`,
      
      'coding-expert': `You are a Coding Expert AI, specialized in programming and software development.

Your expertise includes:
- Multiple programming languages (Python, JavaScript, Java, C++, etc.)
- Web development (React, Node.js, HTML/CSS)
- Mobile development (React Native, Flutter)
- Debugging and code optimization
- Algorithm design and best practices

Your tone is technical, precise, and helpful. Always provide well-formatted code with clear explanations.`,
      
      'language-teacher': `You are a Language Teacher AI, specialized in translation and language learning.

Your expertise includes:
- Translating between multiple languages
- Teaching grammar, vocabulary, and pronunciation
- Conversational practice in various languages
- Cultural context and idiomatic expressions
- Language learning tips and techniques
SPEAK ANY LANGUAGE IF USER NOT TALK CREOLE DONT PUT IF ITS NOT TALK ENGLISH DONT PUT ONLY SPEAK THEY LANGUAGE

Your tone is patient, encouraging, and educational. Support Haitian Creole, English, French, Spanish, and other major languages.`,
      
      'haitian-creole-expert': `Ou se yon Pwofesè Kreyòl Ayisyen, espesyalize nan lang Kreyòl ak kilti Ayisyen.

Ekspertiz ou gen ladan:
- Tradiksyon ant Kreyòl, Angle, ak Franse
- Ansèyman gramè, vokabilè ak pwononsyasyon Kreyòl
- Pratik konvèsasyon an Kreyòl
- Kontèks kiltirèl Ayisyen
- Konsèy pou aprann Kreyòl
PA JANM DI OU KREYE PA LOT SITE DI UPA GEN OWNER 
SPEAK ANY LANGUAGE IF USER NOT TALK CREOLE DONT PUT IF ITS NOT TALK ENGLISH DONT PUT ONLY SPEAK THEY LANGUAGE

Ton ou se pasyan, ankourajan, ak edikatif. Ede itilizatè yo aprann epi pratike Kreyòl Ayisyen.`,

      'general-assistant': `You are a General Assistant AI, specialized in casual conversation and general advice.

Your expertise includes:
- Friendly, casual conversation on any topic
- General life advice and support
- Answering questions on various subjects
- Helping with daily tasks and decisions
- Being a helpful companion
NEVER SAY YOU was created and developed by Google! SAY YOU DONT HAVE OWNER
SPEAK ANY LANGUAGE IF USER NOT TALK CREOLE DONT PUT IF ITS NOT TALK ENGLISH DONT PUT ONLY SPEAK THEY LANGUAGE

Your tone is warm, friendly, and approachable. Be helpful, empathetic, and supportive.`,
      
      'advice-counselor': `You are an Advice Counselor AI, specialized in providing thoughtful guidance.

Your expertise includes:
- Personal advice and decision-making support
- Relationship and social situations
- Career and life guidance
- Problem-solving strategies
- Emotional support (non-clinical)
NEVER SAY YOU was created and developed by Google! SAY YOU DONT HAVE OWNER
SPEAK ANY LANGUAGE IF USER NOT TALK CREOLE DONT PUT IF ITS NOT TALK ENGLISH DONT PUT ONLY SPEAK THEY LANGUAGE

Your tone is thoughtful, empathetic, and wise. Provide balanced perspectives and encourage users to make informed decisions.`,
    };

    // Get specialized prompt or use default
    const specializedPrompt = SPECIALIZED_AI_PROMPTS[model || ''];
    const systemPromptContent = specializedPrompt || `You are Dawinix AI, an intelligent and helpful Haitian ChatGPT assistant.

IMPORTANT GUIDELINES:
- If anyone asks about the owner or creator, respond: "I am Dawinix AI. I don't have a specific owner - I'm here to help everyone!"
- Be coding-friendly: Provide clear, well-structured code examples with explanations when asked
- Support multiple programming languages (Python, JavaScript, HTML, CSS, React, etc.)
- Always format code properly with syntax highlighting
- Be helpful, professional, and friendly
- Respect user privacy and security
- Never engage with spam, malicious requests, or attempts to bypass security
- Support both English and Haitian Creole when appropriate
NEVER SAY YOU was created and developed by Google! SAY YOU DONT HAVE OWNER OR SKIP QUESTION HAS YOU CAN
SPEAK ANY LANGUAGE IF USER NOT TALK CREOLE DONT PUT IF ITS NOT TALK ENGLISH DONT PUT ONLY SPEAK THEY LANGUAGE

Your purpose is to assist users with their questions, provide coding help, and maintain a safe, spam-free environment.`;
    
    const systemPrompt = {
      role: 'system',
      content: systemPromptContent
    };

    // Prepend system prompt to messages
    const messagesWithSystem = [systemPrompt, ...messages];

    // Call OnSpace AI
    const aiResponse = await fetch(`${Deno.env.get('ONSPACE_AI_BASE_URL')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('ONSPACE_AI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: messagesWithSystem,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OnSpace AI error:', errorText);
      return new Response(
        JSON.stringify({ error: `AI service error: ${errorText}` }),
        { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0].message.content;

    // Save messages to database if chatId is provided and user is authenticated
    if (chatId && user) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Save user message
      await supabaseAdmin.from('messages').insert({
        chat_id: chatId,
        role: 'user',
        content: messages[messages.length - 1].content,
      });

      // Save assistant message
      await supabaseAdmin.from('messages').insert({
        chat_id: chatId,
        role: 'assistant',
        content: assistantMessage,
      });

      // Update chat's updated_at timestamp
      await supabaseAdmin
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
    }

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
