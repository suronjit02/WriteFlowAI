import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getDbUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('template_id');
    const status = searchParams.get('status') || 'approved'; // Default to approved

    let query = supabaseAdmin
      .from('reviews')
      .select('*, user:users(name, avatar, email), template:templates(title)');

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Fetch reviews error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('GET reviews error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

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
    const { rating, content, template_id } = body;

    if (!rating || !template_id) {
      return NextResponse.json({ error: 'Rating and template ID are required' }, { status: 400 });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    const { data: newReview, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        rating: ratingNum,
        content: content || '',
        template_id,
        user_id: dbUser.id,
        status: 'pending' // requires admin approval
      })
      .select()
      .single();

    if (error) {
      console.error('Submit review error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    console.error('POST review error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
