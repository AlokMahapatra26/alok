import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your-project') &&
    supabaseUrl.startsWith('http')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');

// ==========================================
// Authentication Helpers
// ==========================================

export async function getAuthorSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session.user;
}

export async function signInAuthor(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured yet. Please set your credentials in .env');
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOutAuthor() {
  if (!isSupabaseConfigured()) return;
  return await supabase.auth.signOut();
}

// ==========================================
// Database Helpers: Stories
// ==========================================

export async function getSupabaseStories() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories from Supabase:', error);
    return [];
  }
  return (data || []).map((s: any) => {
    let coverImage = s.cover_image || '';
    let content = s.content || [];
    if (!coverImage && content.length > 0 && typeof content[0] === 'string' && content[0].startsWith('__COVER__:')) {
      coverImage = content[0].replace('__COVER__:', '').trim();
      content = content.slice(1);
    }
    return {
      ...s,
      cover_image: coverImage,
      content
    };
  });
}

export async function createSupabaseStory(story: {
  title: string;
  subtitle?: string;
  excerpt: string;
  category?: string;
  read_time?: string;
  content: string[];
  featured?: boolean;
  cover_image?: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials in .env');
  }

  const slug = story.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);

  const payload: any = {
    ...story,
    slug,
    published: true
  };

  try {
    const { data, error } = await supabase
      .from('stories')
      .insert([payload])
      .select()
      .single();

    if (!error) return data;

    // If cover_image column doesn't exist yet in Supabase table, fallback gracefully
    if (error && error.message && error.message.includes('cover_image')) {
      delete payload.cover_image;
      if (story.cover_image) {
        payload.content = [`__COVER__:${story.cover_image}`, ...(payload.content || [])];
      }
      const { data: retryData, error: retryError } = await supabase
        .from('stories')
        .insert([payload])
        .select()
        .single();
      if (retryError) throw retryError;
      return retryData;
    }
    throw error;
  } catch (err: any) {
    if (err && err.message && err.message.includes('cover_image')) {
      delete payload.cover_image;
      if (story.cover_image) {
        payload.content = [`__COVER__:${story.cover_image}`, ...(payload.content || [])];
      }
      const { data: retryData, error: retryError } = await supabase
        .from('stories')
        .insert([payload])
        .select()
        .single();
      if (retryError) throw retryError;
      return retryData;
    }
    throw err;
  }
}

export async function updateSupabaseStory(id: string, updates: {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  category?: string;
  read_time?: string;
  content?: string[];
  featured?: boolean;
  cover_image?: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials in .env');
  }

  const payload: any = { ...updates };

  try {
    const { data, error } = await supabase
      .from('stories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (!error) return data;

    if (error && error.message && error.message.includes('cover_image')) {
      delete payload.cover_image;
      if (updates.cover_image !== undefined) {
        const cleanContent = (payload.content || []).filter((p: string) => !p.startsWith('__COVER__:'));
        if (updates.cover_image) {
          cleanContent.unshift(`__COVER__:${updates.cover_image}`);
        }
        payload.content = cleanContent;
      }
      const { data: retryData, error: retryError } = await supabase
        .from('stories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (retryError) throw retryError;
      return retryData;
    }
    throw error;
  } catch (err: any) {
    if (err && err.message && err.message.includes('cover_image')) {
      delete payload.cover_image;
      if (updates.cover_image !== undefined) {
        const cleanContent = (payload.content || []).filter((p: string) => !p.startsWith('__COVER__:'));
        if (updates.cover_image) {
          cleanContent.unshift(`__COVER__:${updates.cover_image}`);
        }
        payload.content = cleanContent;
      }
      const { data: retryData, error: retryError } = await supabase
        .from('stories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (retryError) throw retryError;
      return retryData;
    }
    throw err;
  }
}

export async function deleteSupabaseStory(id: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials in .env');
  }

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ==========================================
// Database Helpers: Diary Entries
// ==========================================

export async function getSupabaseDiaryEntries() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diary entries from Supabase:', error);
    return [];
  }
  return data || [];
}

export async function createSupabaseDiaryEntry(entry: {
  title: string;
  content: string[];
  mood: string;
  mood_emoji: string;
  location?: string;
  weather?: string;
  time_of_day?: string;
  read_time?: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials in .env');
  }

  const slug = entry.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);

  const { data, error } = await supabase
    .from('diary_entries')
    .insert([{
      ...entry,
      slug
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSupabaseDiaryEntry(id: string, updates: {
  title?: string;
  content?: string[];
  mood?: string;
  mood_emoji?: string;
  location?: string;
  weather?: string;
  time_of_day?: string;
  read_time?: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials in .env');
  }

  const { data, error } = await supabase
    .from('diary_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSupabaseDiaryEntry(id: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials in .env');
  }

  const { error } = await supabase
    .from('diary_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ==========================================
// Database Helpers: Reader Comments
// ==========================================

export async function getSupabaseComments(storySlug: string) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('story_slug', storySlug)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments from Supabase:', error);
    return [];
  }
  return data || [];
}

export async function addSupabaseComment(comment: {
  story_slug: string;
  author: string;
  text: string;
}) {
  if (!isSupabaseConfigured()) {
    // If not configured, caller can fallback to local storage
    return null;
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function likeSupabaseComment(commentId: string, currentLikes: number) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('comments')
    .update({ likes: currentLikes + 1 })
    .eq('id', commentId);

  if (error) console.error('Error liking comment:', error);
}

export async function deleteSupabaseComment(commentId: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) console.error('Error deleting comment:', error);
}
