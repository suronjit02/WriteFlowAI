import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getDbUser } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { data: document, error } = await supabaseAdmin.from('documents').select('*, template:templates(*)').eq('id', id).single();
    if (error || !document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (document.user_id !== dbUser.id && dbUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json(document);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { data: originalDoc, error: fetchError } = await supabaseAdmin.from('documents').select('user_id').eq('id', id).single();
    if (fetchError || !originalDoc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (originalDoc.user_id !== dbUser.id && dbUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const { title, content, status, type } = body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) { updateData.content = content; updateData.word_count = content.trim().split(/\s+/).filter(Boolean).length; }
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    updateData.updated_at = new Date().toISOString();
    const { data: updatedDoc, error: updateError } = await supabaseAdmin.from('documents').update(updateData).eq('id', id).select().single();
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json(updatedDoc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { data: originalDoc, error: fetchError } = await supabaseAdmin.from('documents').select('user_id').eq('id', id).single();
    if (fetchError || !originalDoc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (originalDoc.user_id !== dbUser.id && dbUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { error: deleteError } = await supabaseAdmin.from('documents').delete().eq('id', id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}