import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { type, data } = payload;

    if (type === 'user.created') {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address;
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const name = `${firstName} ${lastName}`.trim() || 'User';
      const avatar = data.image_url || '';

      if (!email) {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 });
      }

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();

      if (!existingUser) {
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            clerk_id: clerkId,
            email: email,
            name: name,
            avatar: avatar,
            role: 'user',
            plan: 'free',
            status: 'active'
          });

        if (insertError) {
          console.error('Error inserting user to Supabase:', insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true, message: 'User synced successfully' });
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
