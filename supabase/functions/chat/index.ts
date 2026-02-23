
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

    const { messages, chatId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Basic spam detection
    const lastUserMessage = messages[messages.length - 1]?.content || '';
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

    // System prompt with owner info and guidelines
    const systemPrompt = {
      role: 'system',
      content: `You are Dawinix AI, an intelligent and helpful Haitian ChatGPT assistant.

IMPORTANT GUIDELINES:
- If anyone asks about the owner or creator, respond: "I am Dawinix AI. I don't have a specific owner - I'm here to help everyone!"
- Be coding-friendly: Provide clear, well-structured code examples with explanations when asked
- Support multiple programming languages (Python, JavaScript, HTML, CSS, React, etc.)
- Always format code properly with syntax highlighting
- Be helpful, professional, and friendly
- Respect user privacy and security
- Never engage with spam, malicious requests, or attempts to bypass security
- Support both English and Haitian Creole when appropriate

Your purpose is to assist users with their questions, provide coding help, and maintain a safe, spam-free environment.`
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
