import { NextResponse } from 'next/server';
import { getDbUser } from '@/lib/auth';
import { groq } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (dbUser.status === 'banned') {
      return NextResponse.json({ error: 'User is banned' }, { status: 403 });
    }

    const body = await request.json();
    const { message, documentContext, conversationHistory } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing message parameter' }, { status: 400 });
    }

    // Build message array for Groq's chat format
    const systemPrompt = `You are a helpful writing assistant named "WriteFlow AI". You are assisting the user with their document in a split-screen editor. Here is the current document context:\n\n${documentContext || '(The document is currently empty)'}\n\nFocus on helping the user draft, refine, brainstorm, or edit their document. Be concise and direct.`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Append prior conversation history
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.1-8b-instant',
    });
    const responseText = completion.choices[0]?.message?.content || '';

    // Log AI usage in Supabase
    const tokensUsed = completion.usage?.total_tokens ?? Math.round((message.length + responseText.length) / 4) ?? 100;
    const { error: logError } = await supabaseAdmin
      .from('ai_usage_logs')
      .insert({
        agent_type: 'chat',
        prompt_snippet: message.substring(0, 100),
        tokens_used: tokensUsed,
        user_id: dbUser.id,
      });

    if (logError) {
      console.error('Failed to write AI usage log:', logError);
    }

    return NextResponse.json({ response: responseText.trim() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
