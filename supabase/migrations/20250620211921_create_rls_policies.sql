-- Migration: Create Row Level Security (RLS) policies
-- Purpose: Establishes security policies for admins, workers, and time_registrations tables
-- Created: 2024-01-01 12:01:00 UTC
-- Affects: Creates RLS policies for data access control

-- RLS Policies for admins table
-- Administrators can only view and update their own data

-- Policy: Admins can view their own data
create policy "admins_select_own_data" on public.admins
    for select 
    to authenticated
    using (user_id = auth.uid());

-- Policy: Admins can update their own data
create policy "admins_update_own_data" on public.admins
    for update 
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- Policy: Allow admins to insert their own data (for new admin creation)
create policy "admins_insert_own_data" on public.admins
    for insert 
    to authenticated
    with check (user_id = auth.uid());

-- RLS Policies for workers table
-- Only authenticated administrators can manage workers
-- No direct access for anonymous users or workers themselves

-- Policy: Admins can view all workers
create policy "admins_select_workers" on public.workers
    for select 
    to authenticated
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Policy: Admins can insert new workers
create policy "admins_insert_workers" on public.workers
    for insert 
    to authenticated
    with check (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Policy: Admins can update workers
create policy "admins_update_workers" on public.workers
    for update 
    to authenticated
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Policy: Admins can delete workers (soft delete via is_active)
create policy "admins_delete_workers" on public.workers
    for delete 
    to authenticated
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- RLS Policies for time_registrations table
-- Only authenticated administrators can manage time registrations
-- Workers don't have direct database access (they use API with service key)

-- Policy: Admins can view all time registrations
create policy "admins_select_time_registrations" on public.time_registrations
    for select 
    to authenticated
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Policy: Admins can insert time registrations
create policy "admins_insert_time_registrations" on public.time_registrations
    for insert 
    to authenticated
    with check (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Policy: Admins can update time registrations
create policy "admins_update_time_registrations" on public.time_registrations
    for update 
    to authenticated
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Policy: Admins can delete time registrations
create policy "admins_delete_time_registrations" on public.time_registrations
    for delete 
    to authenticated
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Additional policies for service role (for worker PIN authentication via API)
-- These policies allow the service role to manage workers and time registrations
-- Service role is used for worker authentication and time tracking operations

-- Policy: Service role can select workers (for PIN authentication)
create policy "service_role_select_workers" on public.workers
    for select 
    to service_role
    using (true);

-- Policy: Service role can insert time registrations (for worker check-ins)
create policy "service_role_insert_time_registrations" on public.time_registrations
    for insert 
    to service_role
    with check (true);

-- Policy: Service role can update time registrations (for worker check-outs)
create policy "service_role_update_time_registrations" on public.time_registrations
    for update 
    to service_role
    using (true)
    with check (true);

-- Policy: Service role can select time registrations (for validation)
create policy "service_role_select_time_registrations" on public.time_registrations
    for select 
    to service_role
    using (true);

-- Comments explaining the security model
comment on policy "admins_select_own_data" on public.admins is 'Admins can only view their own profile data';
comment on policy "admins_update_own_data" on public.admins is 'Admins can only update their own profile data';
comment on policy "admins_select_workers" on public.workers is 'Only authenticated admins can view worker data';
comment on policy "admins_select_time_registrations" on public.time_registrations is 'Only authenticated admins can view time registration data';
comment on policy "service_role_select_workers" on public.workers is 'Service role needs access for worker PIN authentication';
comment on policy "service_role_insert_time_registrations" on public.time_registrations is 'Service role inserts time registrations for worker check-ins'; 