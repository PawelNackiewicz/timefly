-- Migration: Remove unique constraint from workers.pin_hash
-- Purpose: Allow multiple workers to have the same PIN
-- Created: 2025-11-02
-- Affects: Removes unique constraint from public.workers.pin_hash column

-- Drop the unique constraint on pin_hash
-- This allows multiple workers to share the same PIN
alter table public.workers 
drop constraint if exists workers_pin_hash_key;

-- Update comment to reflect the change
comment on column public.workers.pin_hash is 'Hashed PIN for worker authentication, can be shared by multiple workers';

-- Note: The application layer handles PIN verification by iterating through all workers
-- and verifying the PIN against each hash. This approach works well when multiple
-- workers can share the same PIN.

