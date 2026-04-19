-- Update all users with role 'WALKIN_CUSTOMER' to 'CUSTOMER'
UPDATE users SET role = 'CUSTOMER' WHERE role = 'WALKIN_CUSTOMER';

-- Drop the old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role;

-- Add the new constraint without 'WALKIN_CUSTOMER'
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'CUSTOMER', 'KITCHEN_STAFF', 'WAITER'));
