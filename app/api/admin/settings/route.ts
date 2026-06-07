import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getDbUser } from '@/lib/auth';

export async function GET() {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (dbUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('GET settings error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (dbUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const {
      site_name,
      maintenance_mode,
      agent_draft_enabled,
      agent_rewrite_enabled,
      agent_chat_enabled,
    } = body;

    // Get existing record id
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('site_settings')
      .select('id')
      .limit(1)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Settings record not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (site_name !== undefined) updates.site_name = site_name;
    if (maintenance_mode !== undefined) updates.maintenance_mode = maintenance_mode;
    if (agent_draft_enabled !== undefined) updates.agent_draft_enabled = agent_draft_enabled;
    if (agent_rewrite_enabled !== undefined) updates.agent_rewrite_enabled = agent_rewrite_enabled;
    if (agent_chat_enabled !== undefined) updates.agent_chat_enabled = agent_chat_enabled;

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('PUT settings error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
