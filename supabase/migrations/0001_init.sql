-- Create agents table
create table agents (
  id text primary key,
  name text not null,
  emoji text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Create outreach table
create table outreach (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id) not null,
  activity_date date not null,
  attempts int not null default 0 check (attempts between 0 and 200),
  leads int not null default 0 check (leads between 0 and 50),
  note text,
  logged_at timestamptz default now(),
  check (attempts + leads > 0)
);

-- Create sprint_config table
create table sprint_config (
  id int primary key default 1,
  name text not null default 'Mayhem Sprint',
  start_date date not null,
  end_date date not null,
  daily_goal int not null default 5,
  weekly_goal int not null default 25,
  check (id = 1)
);

-- Indexes for performance
create index outreach_agent_date_idx on outreach(agent_id, activity_date desc);
create index outreach_date_idx on outreach(activity_date desc);
create index outreach_logged_idx on outreach(logged_at desc);

-- Enable Row Level Security
alter table agents enable row level security;
alter table outreach enable row level security;
alter table sprint_config enable row level security;

-- RLS Policies
create policy "anon read agents" on agents for select using (true);
create policy "anon read outreach" on outreach for select using (true);
create policy "anon insert outreach" on outreach for insert with check (
  attempts between 0 and 200
  and leads between 0 and 50
  and (attempts + leads) > 0
);
create policy "anon read config" on sprint_config for select using (true);

-- Enable Realtime on outreach table
alter publication supabase_realtime add table outreach;

-- Seed sprint_config
insert into sprint_config (name, start_date, end_date, daily_goal, weekly_goal)
values ('Mayhem Sprint', '2026-05-12', '2026-06-30', 5, 25);

-- Seed agents (12 placeholders, edit in /admin or Supabase)
insert into agents (id, name, emoji) values
  ('jason-obrien', 'Jason O''Brien', '🎯'),
  ('agent-2', 'TBD', '⚡'),
  ('agent-3', 'TBD', '💪'),
  ('agent-4', 'TBD', '🔥'),
  ('agent-5', 'TBD', '🎪'),
  ('agent-6', 'TBD', '⭐'),
  ('agent-7', 'TBD', '🚀'),
  ('agent-8', 'TBD', '💎'),
  ('agent-9', 'TBD', '🎨'),
  ('agent-10', 'TBD', '🎭'),
  ('agent-11', 'TBD', '🏆'),
  ('agent-12', 'TBD', '🌟');
