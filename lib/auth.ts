import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase';

export async function getDbUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const { data: dbUser, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error || !dbUser) {
      console.error('Failed to get database user for Clerk ID:', userId, error);
      return null;
    }

    return dbUser;
  } catch (error) {
    console.error('Error in getDbUser:', error);
    return null;
  }
}
