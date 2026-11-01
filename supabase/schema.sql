-- =============================================================================
-- AI Travel Planner — run this ONCE in Supabase → SQL Editor → New query → Run
-- =============================================================================

-- 1) Profiles (linked to Supabase Auth users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  home_city   text,
  preferences jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile when someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Places catalog (Discover page)
create table if not exists public.places (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  state         text,
  country       text not null default 'India',
  rating        numeric(2,1) default 0,
  review_count  int default 0,
  tags          text[] default '{}',
  blurb         text,
  best_time     text,
  must_try      text[] default '{}',
  safety_tips   text[] default '{}',
  image_url     text,
  lat           double precision,
  lng           double precision,
  region        text default 'india',
  is_active     boolean default true,
  created_at    timestamptz not null default now()
);

-- 3) Saved trips (AI itinerary lives in plan jsonb)
create table if not exists public.trips (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  title               text,
  destination         text not null,
  destination_slug    text references public.places (slug),
  budget              numeric not null,
  days                int not null check (days > 0),
  people              int default 1,
  transport           text,
  food_preference     text,
  travel_style        text,
  interests           text[] default '{}',
  safety_preference   text,
  pet_friendly        boolean default false,
  festival_music      text,
  plan                jsonb not null default '{}'::jsonb,
  cover_image_url     text,
  weather_snapshot    jsonb,
  status              text not null default 'saved',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists trips_user_created_idx
  on public.trips (user_id, created_at desc);

-- 4) Reviews
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  place_slug  text references public.places (slug),
  place_name  text not null,
  rating      int not null check (rating between 1 and 5),
  text        text not null,
  category    text,
  location    text,
  media_urls  text[] default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists reviews_place_idx on public.reviews (place_slug, created_at desc);

-- 5) Row Level Security
alter table public.profiles enable row level security;
alter table public.places   enable row level security;
alter table public.trips    enable row level security;
alter table public.reviews  enable row level security;

-- Profiles: own row only
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Places: public read
drop policy if exists "places_public_read" on public.places;
create policy "places_public_read" on public.places
  for select using (is_active = true);

-- Trips: own rows only
drop policy if exists "trips_select_own" on public.trips;
create policy "trips_select_own" on public.trips
  for select using (auth.uid() = user_id);

drop policy if exists "trips_insert_own" on public.trips;
create policy "trips_insert_own" on public.trips
  for insert with check (auth.uid() = user_id);

drop policy if exists "trips_update_own" on public.trips;
create policy "trips_update_own" on public.trips
  for update using (auth.uid() = user_id);

drop policy if exists "trips_delete_own" on public.trips;
create policy "trips_delete_own" on public.trips
  for delete using (auth.uid() = user_id);

-- Reviews: anyone can read; only owner writes
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete using (auth.uid() = user_id);

-- 6) Seed starter places (Discover page)
insert into public.places (slug, name, state, rating, review_count, tags, blurb, best_time, must_try, safety_tips, lat, lng)
values
  (
    'jaipur', 'Jaipur', 'Rajasthan', 4.7, 2841,
    array['Heritage','Shopping','Photography'],
    'Forts, bazaars and pink sandstone facades glowing at golden hour.',
    'October – March',
    array['Dal Baati Churma','Pyaaz Kachori','Lassi at Lassiwala'],
    array['Pre-paid autos from railway station','Avoid gem-shop touts near Hawa Mahal'],
    26.9124, 75.7873
  ),
  (
    'goa', 'Goa', 'Goa', 4.6, 5120,
    array['Beaches','Nightlife','Adventure'],
    'Coastline, water sports, Portuguese lanes and long sunset evenings.',
    'November – February',
    array['Goan Fish Curry','Bebinca','Prawn Balchão'],
    array['Swim only in lifeguard-flagged zones','Rent scooters with valid licence'],
    15.2993, 74.1240
  ),
  (
    'kerala', 'Alleppey', 'Kerala', 4.8, 3390,
    array['Nature','Relaxation','Backwaters'],
    'Houseboats drifting through palm-lined backwaters at first light.',
    'September – March',
    array['Karimeen Pollichathu','Appam with stew','Tender coconut'],
    array['Life jackets on shikara rides','Carry mosquito repellent'],
    9.4981, 76.3388
  ),
  (
    'manali', 'Manali', 'Himachal Pradesh', 4.5, 4103,
    array['Mountains','Hiking','Snow'],
    'Pine valleys, snow passes and cafés with a view of the Beas.',
    'December – February, May – June',
    array['Siddu','Trout fry','Himachali Dham'],
    array['Check Atal Tunnel status before driving','Altitude: hydrate on day one'],
    32.2396, 77.1887
  ),
  (
    'delhi', 'Delhi', 'Delhi NCR', 4.4, 6210,
    array['Food','History','Culture'],
    'Mughal monuments, street-food alleys and sprawling green boulevards.',
    'October – March',
    array['Chole Bhature in Chandni Chowk','Butter Chicken at Moti Mahal','Daulat ki Chaat'],
    array['Prefer metro for fast cross-city travel','Negotiate auto fares or use ride apps'],
    28.6139, 77.2090
  ),
  (
    'varanasi', 'Varanasi', 'Uttar Pradesh', 4.9, 3890,
    array['Spiritual','Ghats','Heritage'],
    'Sunrise boat rides, evening Ganga aarti and timeless narrow alleys.',
    'November – February',
    array['Malaiyo (winters)','Kachori Sabzi at Ram Bhandar','Banarasi Paan'],
    array['Beware of fake guides at Dashashwamedh Ghat','Keep shoes safe near temples'],
    25.3176, 82.9739
  )
on conflict (slug) do nothing;
