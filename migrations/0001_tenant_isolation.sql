-- Source application database migration: tenant isolation.
-- A tenant is identified by its root admin's profile UUID.
BEGIN;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE data_banks ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- Existing workspace belongs to Gil. New admins own isolated empty workspaces.
UPDATE profiles
SET tenant_id = id
WHERE tenant_id IS NULL AND role = 'admin';

UPDATE profiles
SET tenant_id = '2cf04545-ced4-42f6-94d2-1f4c0aaf9f76'
WHERE tenant_id IS NULL;

UPDATE departments
SET tenant_id = '2cf04545-ced4-42f6-94d2-1f4c0aaf9f76'
WHERE tenant_id IS NULL;

UPDATE data_banks
SET tenant_id = created_by
WHERE tenant_id IS NULL;

UPDATE forms
SET tenant_id = created_by
WHERE tenant_id IS NULL;

UPDATE schedules
SET tenant_id = created_by
WHERE tenant_id IS NULL;

ALTER TABLE profiles ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE departments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE data_banks ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE forms ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE schedules ALTER COLUMN tenant_id SET NOT NULL;

-- Names are unique within a tenant, not across every customer.
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_name_unique;
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_name_unique;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS departments_tenant_name_unique
  ON departments (tenant_id, name);
CREATE UNIQUE INDEX IF NOT EXISTS schedules_tenant_name_unique
  ON schedules (tenant_id, name);

CREATE INDEX IF NOT EXISTS profiles_tenant_id_idx ON profiles (tenant_id);
CREATE INDEX IF NOT EXISTS data_banks_tenant_id_idx ON data_banks (tenant_id);
CREATE INDEX IF NOT EXISTS forms_tenant_active_idx ON forms (tenant_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS schedules_tenant_created_idx ON schedules (tenant_id, created_at DESC);

COMMIT;
