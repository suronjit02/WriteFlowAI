import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getDbUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { data: template, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (dbUser.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.prompt !== undefined) updateData.prompt = body.prompt;
    if (body.sample_output !== undefined)
      updateData.sample_output = body.sample_output;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.tone !== undefined) updateData.tone = body.tone;
    if (body.estimated_words !== undefined)
      updateData.estimated_words = parseInt(body.estimated_words, 10);
    if (body.usage_count !== undefined)
      updateData.usage_count = parseInt(body.usage_count, 10);
    if (body.rating !== undefined) updateData.rating = parseFloat(body.rating);
    const { data, error } = await supabaseAdmin
      .from("templates")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (dbUser.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("templates")
      .delete()
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
