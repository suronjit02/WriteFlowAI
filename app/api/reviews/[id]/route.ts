import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDbUser } from "@/lib/auth";

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
    const { status } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status required" },
        { status: 400 },
      );
    }

    const { data: updatedReview, error: updateError } = await supabaseAdmin
      .from("reviews")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedReview) {
      return NextResponse.json(
        { error: updateError?.message || "Review not found" },
        { status: 500 },
      );
    }

    const templateId = updatedReview.template_id;
    if (templateId) {
      const { data: approvedReviews } = await supabaseAdmin
        .from("reviews")
        .select("rating")
        .eq("template_id", templateId)
        .eq("status", "approved");
      if (approvedReviews) {
        const count = approvedReviews.length;
        const avg =
          count > 0
            ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count
            : 0;
        await supabaseAdmin
          .from("templates")
          .update({ rating: Math.round(avg * 10) / 10 })
          .eq("id", templateId);
      }
    }

    return NextResponse.json(updatedReview);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
