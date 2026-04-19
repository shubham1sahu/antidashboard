-- Delete orders associated with customers
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE role = 'CUSTOMER'));
DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE role = 'CUSTOMER');

-- Delete reservations associated with customers
DELETE FROM reservations WHERE user_id IN (SELECT id FROM users WHERE role = 'CUSTOMER');

-- Delete the customers
DELETE FROM users WHERE role = 'CUSTOMER';
