import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getDbUser } from '@/lib/auth';
import { startOfDay, subDays, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Basic Stats
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: totalDocuments } = await supabaseAdmin
      .from('documents')
      .select('*', { count: 'exact', head: true });

    const startOfToday = startOfDay(new Date());
    const { count: aiCallsToday } = await supabaseAdmin
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfToday.toISOString());

    // 2. Content Type Breakdown
    const { data: docTypes } = await supabaseAdmin
      .from('documents')
      .select('type');

    const typeCounts: Record<string, number> = { blog: 0, social: 0, email: 0, ad: 0 };
    if (docTypes) {
      docTypes.forEach((doc) => {
        if (doc.type && typeCounts[doc.type] !== undefined) {
          typeCounts[doc.type]++;
        }
      });
    }
    const contentTypeData = Object.entries(typeCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // 3. Daily AI Usage (last 7 days)
    const sevenDaysAgo = subDays(startOfToday, 6);
    const { data: logs } = await supabaseAdmin
      .from('ai_usage_logs')
      .select('created_at, agent_type')
      .gte('created_at', sevenDaysAgo.toISOString());

    const dailyUsageMap: Record<string, Record<string, number>> = {};
    for (let i = 0; i < 7; i++) {
      const dateStr = format(subDays(new Date(), i), 'MMM dd');
      dailyUsageMap[dateStr] = { draft: 0, rewrite: 0, chat: 0, summarise: 0, total: 0 };
    }

    if (logs) {
      logs.forEach((log) => {
        const dateStr = format(new Date(log.created_at), 'MMM dd');
        if (dailyUsageMap[dateStr]) {
          const type = log.agent_type || 'draft';
          dailyUsageMap[dateStr][type]++;
          dailyUsageMap[dateStr].total++;
        }
      });
    }

    const dailyUsageData = Object.entries(dailyUsageMap)
      .map(([date, counts]) => ({
        date,
        Drafts: counts.draft,
        Rewrites: counts.rewrite,
        Chats: counts.chat,
        Summaries: counts.summarise,
        Total: counts.total
      }))
      .reverse();

    // 4. User Signups (last 30 days)
    const thirtyDaysAgo = subDays(startOfToday, 29);
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const signupMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const dateStr = format(subDays(new Date(), i), 'MM-dd');
      signupMap[dateStr] = 0;
    }

    if (users) {
      users.forEach((user) => {
        const dateStr = format(new Date(user.created_at), 'MM-dd');
        if (signupMap[dateStr] !== undefined) {
          signupMap[dateStr]++;
        }
      });
    }

    const signupData = Object.entries(signupMap)
      .map(([date, count]) => ({
        date,
        Signups: count
      }))
      .reverse();

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalDocuments: totalDocuments || 0,
        aiCallsToday: aiCallsToday || 0,
        revenue: 0 // Mock revenue as $0 per prompt request
      },
      charts: {
        contentTypeData,
        dailyUsageData,
        signupData
      }
    });
  } catch (error: any) {
    console.error('GET admin analytics error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
