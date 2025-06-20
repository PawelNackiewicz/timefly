-- Migration: Create helper functions and triggers
-- Purpose: Creates utility functions and triggers for the TimeFly system
-- Created: 2024-01-01 12:02:00 UTC
-- Affects: Creates functions: is_admin(), set_admin_modification() and related triggers

-- Function: is_admin()
-- Purpose: Helper function to check if the current user is an administrator
-- Returns: boolean - true if current user is an admin, false otherwise
-- Security: SECURITY DEFINER allows function to access auth.uid() regardless of caller's permissions

create or replace function public.is_admin()
returns boolean 
language plpgsql 
security definer
as $$
begin
    -- Check if the current authenticated user exists in the admins table
    return exists (
        select 1 from public.admins
        where user_id = auth.uid()
    );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.is_admin() to authenticated;

-- Function: set_admin_modification()
-- Purpose: Trigger function to automatically set modified_by_admin_id when manual_intervention is set to true
-- This ensures proper audit trail when administrators modify time registrations
-- Returns: trigger - the modified NEW record

create or replace function public.set_admin_modification()
returns trigger 
language plpgsql
as $$
begin
    -- Only set modified_by_admin_id when manual_intervention changes from false to true
    -- This prevents overwriting the original admin who made the intervention
    if new.manual_intervention = true and old.manual_intervention = false then
        new.modified_by_admin_id = (
            select id from public.admins 
            where user_id = auth.uid()
        );
        -- Also update the updated_at timestamp
        new.updated_at = now();
    end if;
    
    return new;
end;
$$;

-- Create trigger on time_registrations table
-- This trigger fires before any update to automatically track admin modifications
create trigger trigger_set_admin_modification
    before update on public.time_registrations
    for each row
    execute function public.set_admin_modification();

-- Function: update_updated_at_column()
-- Purpose: Generic trigger function to automatically update the updated_at timestamp
-- This ensures consistent timestamp tracking across all tables
-- Returns: trigger - the modified NEW record with updated timestamp

create or replace function public.update_updated_at_column()
returns trigger 
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Create triggers for automatic updated_at timestamp updates
-- These triggers ensure updated_at is always current when records are modified

-- Trigger for admins table
create trigger trigger_update_admins_updated_at
    before update on public.admins
    for each row
    execute function public.update_updated_at_column();

-- Trigger for workers table
create trigger trigger_update_workers_updated_at
    before update on public.workers
    for each row
    execute function public.update_updated_at_column();

-- Note: time_registrations already has its updated_at handled by set_admin_modification()
-- so we don't need a separate trigger for it

-- Function: get_active_workers()
-- Purpose: Returns only active workers (is_active = true)
-- This is a helper function for common queries
-- Returns: table of active workers

create or replace function public.get_active_workers()
returns table (
    id uuid,
    first_name varchar(100),
    last_name varchar(100),
    department varchar(100),
    created_at timestamptz,
    updated_at timestamptz
)
language sql
security definer
as $$
    select 
        id,
        first_name,
        last_name,
        department,
        created_at,
        updated_at
    from public.workers
    where is_active = true
    order by last_name, first_name;
$$;

-- Grant execute permission to authenticated users (admins)
grant execute on function public.get_active_workers() to authenticated;

-- Function: get_worker_current_registration()
-- Purpose: Gets the current active time registration for a worker (if any)
-- Returns: the current in_progress registration or null
-- Parameters: worker_uuid - the UUID of the worker

create or replace function public.get_worker_current_registration(worker_uuid uuid)
returns table (
    id uuid,
    worker_id uuid,
    check_in timestamptz,
    check_out timestamptz,
    status varchar(50),
    manual_intervention boolean,
    modified_by_admin_id uuid,
    notes text,
    created_at timestamptz,
    updated_at timestamptz
)
language sql
security definer
as $$
    select 
        id,
        worker_id,
        check_in,
        check_out,
        status,
        manual_intervention,
        modified_by_admin_id,
        notes,
        created_at,
        updated_at
    from public.time_registrations
    where worker_id = worker_uuid 
    and status = 'in_progress'
    order by check_in desc
    limit 1;
$$;

-- Grant execute permission to service_role (for API endpoints)
grant execute on function public.get_worker_current_registration(uuid) to service_role;
grant execute on function public.get_worker_current_registration(uuid) to authenticated;

-- Comments for documentation
comment on function public.is_admin() is 'Helper function to check if current user is an administrator';
comment on function public.set_admin_modification() is 'Trigger function to track admin modifications to time registrations';
comment on function public.update_updated_at_column() is 'Generic trigger function to update updated_at timestamps';
comment on function public.get_active_workers() is 'Returns list of active workers only';
comment on function public.get_worker_current_registration(uuid) is 'Gets current active time registration for a specific worker'; 