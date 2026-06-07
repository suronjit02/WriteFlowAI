import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getDbUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('documents')
      .select('*, template:templates(title)', { count: 'exact' })
      .eq('user_id', dbUser.id);

    // Filter by search
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by type
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    // Default sort: newest updated first
    query = query.order('updated_at', { ascending: false });

    // Pagination
    query = query.range(from, to);

    const { data: documents, error, count } = await query;

    if (error) {
      console.error('Fetch documents error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      documents,
      count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0
    });
  } catch (error: any) {
    console.error('GET documents error:', error);
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
    const { title, content, type, status, template_id } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;

    const { data: newDoc, error: insertError } = await supabaseAdmin
      .from('documents')
      .insert({
        title,
        content: content || '',
        type: type || 'blog',
        status: status || 'draft',
        word_count: wordCount,
        user_id: dbUser.id,
        template_id: template_id || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert document error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Increment template usage if applicable
    if (template_id) {
      const { data: tmpl } = await supabaseAdmin
        .from('templates')
        .select('usage_count')
        .eq('id', template_id)
        .single();
      if (tmpl) {
        await supabaseAdmin
          .from('templates')
          .update({ usage_count: (tmpl.usage_count || 0) + 1 })
          .eq('id', template_id);
      }
    }

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error: any) {
    console.error('POST document error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
