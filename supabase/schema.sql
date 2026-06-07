-- Users table
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  clerk_id text unique not null,
  email text unique not null,
  name text,
  avatar text,
  bio text,
  role text default 'user' check (role in ('user', 'admin')),
  plan text default 'free' check (plan in ('free', 'pro', 'team')),
  status text default 'active' check (status in ('active', 'banned')),
  created_at timestamptz default now()
);

-- Templates table
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text check (category in ('blog', 'social', 'email', 'ad')),
  prompt text,
  sample_output text,
  thumbnail text,
  tone text default 'neutral',
  estimated_words int default 500,
  usage_count int default 0,
  rating float default 0,
  created_at timestamptz default now()
);

-- Documents table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  type text check (type in ('blog', 'social', 'email', 'ad')),
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  word_count int default 0,
  user_id uuid references public.users(id) on delete cascade,
  template_id uuid references public.templates(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reviews table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  rating int check (rating between 1 and 5),
  content text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  user_id uuid references public.users(id) on delete cascade,
  template_id uuid references public.templates(id) on delete cascade,
  created_at timestamptz default now()
);

-- AI Usage Logs table
create table if not exists public.ai_usage_logs (
  id uuid default gen_random_uuid() primary key,
  agent_type text check (agent_type in ('draft', 'rewrite', 'chat', 'summarise')),
  prompt_snippet text,
  tokens_used int default 0,
  user_id uuid references public.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Site Settings table
create table if not exists public.site_settings (
  id uuid default gen_random_uuid() primary key,
  site_name text default 'WriteFlow AI',
  maintenance_mode boolean default false,
  agent_draft_enabled boolean default true,
  agent_rewrite_enabled boolean default true,
  agent_chat_enabled boolean default true
);

-- Seed: site settings
insert into public.site_settings (site_name) values ('WriteFlow AI');

-- Seed: 12 Templates
insert into public.templates (title, description, category, prompt, sample_output, tone, estimated_words, usage_count, rating) values
('Professional Blog Post', 'Write a complete SEO-optimized blog post on any topic', 'blog', 'Write a professional blog post about {topic} for {audience}. Tone: {tone}. Word count: {wordCount}', 'Sample blog post content here...', 'formal', 800, 1520, 4.8),
('Social Media Caption', 'Engaging captions for Instagram, Facebook, and LinkedIn', 'social', 'Write an engaging social media caption about {topic} for {audience}. Tone: {tone}', 'Sample caption here...', 'casual', 150, 2340, 4.7),
('Email Newsletter', 'Professional email newsletter template', 'email', 'Write an email newsletter about {topic} for {audience}. Tone: {tone}', 'Sample email here...', 'formal', 400, 980, 4.6),
('Facebook Ad Copy', 'High-converting Facebook advertisement copy', 'ad', 'Write a Facebook ad for {topic} targeting {audience}. Tone: {tone}', 'Sample ad copy here...', 'persuasive', 200, 1100, 4.5),
('LinkedIn Article', 'Thought leadership article for LinkedIn', 'blog', 'Write a LinkedIn article about {topic} for {audience}. Tone: {tone}', 'Sample LinkedIn article...', 'formal', 1000, 760, 4.9),
('Product Description', 'Compelling product descriptions for e-commerce', 'ad', 'Write a product description for {topic} targeting {audience}. Tone: {tone}', 'Sample product description...', 'persuasive', 250, 890, 4.4),
('Welcome Email', 'Warm welcome email for new subscribers', 'email', 'Write a welcome email for {topic} for {audience}. Tone: {tone}', 'Sample welcome email...', 'friendly', 300, 1200, 4.7),
('Twitter/X Thread', 'Viral Twitter thread on any topic', 'social', 'Write a Twitter thread about {topic} for {audience}. Tone: {tone}', 'Sample thread...', 'casual', 280, 1890, 4.6),
('How-To Guide', 'Step-by-step instructional blog post', 'blog', 'Write a how-to guide about {topic} for {audience}. Tone: {tone}', 'Sample guide...', 'neutral', 1200, 640, 4.8),
('Promotional Email', 'Sales and promotional email campaigns', 'email', 'Write a promotional email for {topic} targeting {audience}. Tone: {tone}', 'Sample promo email...', 'persuasive', 350, 720, 4.3),
('Instagram Story', 'Short punchy content for Instagram stories', 'social', 'Write Instagram story content about {topic} for {audience}. Tone: {tone}', 'Sample story content...', 'casual', 100, 2100, 4.5),
('Google Ad Copy', 'Search and display ad copy for Google Ads', 'ad', 'Write Google ad copy for {topic} targeting {audience}. Tone: {tone}', 'Sample Google ad...', 'persuasive', 150, 950, 4.6);
