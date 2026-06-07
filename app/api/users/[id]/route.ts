import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDbUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const isSelf = dbUser.id === id;
    const isAdmin = dbUser.role === "admin";
    if (!isSelf && !isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
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
    const { id } = await params;
    const body = await request.json();
    const { name, bio, avatar, role, status, plan } = body;
    const isSelf = dbUser.id === id;
    const isAdmin = dbUser.role === "admin";
    if (!isSelf && !isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (role !== undefined || status !== undefined || plan !== undefined) {
      if (!isAdmin)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (role !== undefined) updateData.role = role;
      if (status !== undefined) updateData.status = status;
      if (plan !== undefined) updateData.plan = plan;
    }
    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
