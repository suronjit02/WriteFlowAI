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
    const { text, tone } = body;

    if (!text || !tone) {
      return NextResponse.json({ error: 'Missing text or tone parameter' }, { status: 400 });
    }

    const prompt = `Rewrite the following text in a ${tone} tone. Return only the rewritten text, nothing else:\n\n${text}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });
    const responseText = completion.choices[0]?.message?.content || '';

    // Log AI usage in Supabase
    const tokensUsed = completion.usage?.total_tokens ?? Math.round(text.split(/\s+/).length * 1.3) ?? 50;
    const { error: logError } = await supabaseAdmin
      .from('ai_usage_logs')
      .insert({
        agent_type: 'rewrite',
        prompt_snippet: prompt.substring(0, 100),
        tokens_used: tokensUsed,
        user_id: dbUser.id,
      });

    if (logError) {
      console.error('Failed to write AI usage log:', logError);
    }

    return NextResponse.json({ rewrittenText: responseText.trim() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Rewrite API Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
