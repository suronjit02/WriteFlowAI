import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "popular";

    let query = supabase.from("templates").select("*", { count: "exact" });

    if (search) query = query.ilike("title", `%${search}%`);
    if (category && category !== "all") query = query.eq("category", category);
    if (sort === "popular")
      query = query.order("usage_count", { ascending: false });
    else if (sort === "newest")
      query = query.order("created_at", { ascending: false });
    else if (sort === "rating")
      query = query.order("rating", { ascending: false });

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ templates: data, total: count, page, limit });
  } catch (error) {
    console.error("Templates API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}
