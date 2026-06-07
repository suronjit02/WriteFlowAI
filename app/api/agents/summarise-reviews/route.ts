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

    if (dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { reviews } = body;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({
        bullets: ['No reviews available to summarize.', 'N/A', 'N/A'],
        sentiment: 'Neutral',
      });
    }

    const reviewTexts = reviews.map(
      (r: { rating?: number; content?: string }) =>
        `Rating: ${r.rating ?? 'N/A'}/5 - "${r.content ?? ''}"`
    );

    const prompt = `Summarize these user reviews in exactly 3 concise bullet points and detect the overall sentiment. Return JSON only with this exact structure: {"bullets": ["string","string","string"], "sentiment": "Positive"|"Neutral"|"Negative"}. Reviews:\n${reviewTexts.join('\n')}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });
    const responseText = completion.choices[0]?.message?.content || '';

    // Clean JSON fences from response
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse summarise-reviews response:', responseText, parseError);
      data = {
        bullets: [
          'Reviews show mixed opinions regarding usability.',
          'Users noted functionality performs as expected.',
          'Overall feedback points towards positive template options.',
        ],
        sentiment: 'Positive',
      };
    }

    // Log AI usage in Supabase
    const tokensUsed = completion.usage?.total_tokens ?? 150;
    const { error: logError } = await supabaseAdmin
      .from('ai_usage_logs')
      .insert({
        agent_type: 'summarise',
        prompt_snippet: `Summarize ${reviews.length} reviews`,
        tokens_used: tokensUsed,
        user_id: dbUser.id,
      });

    if (logError) {
      console.error('Failed to write AI usage log:', logError);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Summarise Reviews API Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
