-- Migration: Create core tables for TimeFly MVP
-- Purpose: Creates admins, workers, and time_registrations tables with proper constraints
-- Created: 2024-01-01 12:00:00 UTC
-- Affects: Creates new tables: admins, workers, time_registrations

-- Table: admins
-- Purpose: Extends information about administrators from auth.users table
-- Contains admin-specific business information like name and department

create table if not exists public.admins (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique, -- foreign key to auth.users(id)
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    department varchar(100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    -- foreign key constraint to auth.users
    constraint fk_admins_user_id foreign key (user_id) references auth.users(id) on delete cascade
);

-- Enable row level security for admins table
alter table public.admins enable row level security;

-- Table: workers
-- Purpose: Contains workers who report their work time using PIN authentication
-- Workers do not have Supabase Auth accounts, they use PIN-based authentication

create table if not exists public.workers (
    id uuid primary key default gen_random_uuid(),
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    pin_hash varchar(255) not null unique, -- hashed PIN for authentication
    department varchar(100),
    is_active boolean not null default true, -- soft delete functionality
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable row level security for workers table
alter table public.workers enable row level security;

-- Table: time_registrations
-- Purpose: Records work time check-ins and check-outs for workers
-- Supports manual interventions by administrators

create table if not exists public.time_registrations (
    id uuid primary key default gen_random_uuid(),
    worker_id uuid not null, -- foreign key to workers(id)
    check_in timestamptz not null,
    check_out timestamptz, -- null when worker is still checked in
    status varchar(50) not null default 'in_progress', -- 'completed', 'in_progress'
    manual_intervention boolean not null default false, -- true if admin modified the record
    modified_by_admin_id uuid, -- foreign key to admins(id), null if no intervention
    notes text, -- optional admin notes for manual interventions
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    -- constraints
    constraint check_checkout_after_checkin check (check_out is null or check_out > check_in),
    constraint check_valid_status check (status in ('in_progress', 'completed')),
    
    -- foreign key constraints
    constraint fk_time_registrations_worker_id foreign key (worker_id) references public.workers(id) on delete cascade,
    constraint fk_time_registrations_modified_by_admin_id foreign key (modified_by_admin_id) references public.admins(id) on delete set null
);

-- Enable row level security for time_registrations table
alter table public.time_registrations enable row level security;

-- Create indexes for better query performance
-- Index on workers.pin_hash is automatically created due to unique constraint
-- Index on admins.user_id is automatically created due to unique constraint
-- Indexes on foreign keys are automatically created

-- Additional performance indexes
create index if not exists idx_time_registrations_worker_id on public.time_registrations(worker_id);
create index if not exists idx_time_registrations_check_in on public.time_registrations(check_in);
create index if not exists idx_workers_is_active on public.workers(is_active);
create index if not exists idx_time_registrations_status on public.time_registrations(status);

-- Comments for better documentation
comment on table public.admins is 'Administrators who manage the TimeFly system, extends auth.users with business information';
comment on table public.workers is 'Workers who use PIN authentication to track their work time';
comment on table public.time_registrations is 'Work time records with check-in/check-out timestamps and admin intervention tracking';

comment on column public.admins.user_id is 'Foreign key to auth.users, establishes 1:1 relationship with Supabase Auth';
comment on column public.workers.pin_hash is 'Hashed PIN for worker authentication, must be unique';
comment on column public.workers.is_active is 'Soft delete flag, inactive workers cannot check in/out';
comment on column public.time_registrations.manual_intervention is 'Flag indicating if admin has modified this record';
comment on column public.time_registrations.modified_by_admin_id is 'Admin who made the last manual intervention'; 