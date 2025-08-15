-- Reset admin password back to plain text "Flugel"
UPDATE admin_config 
SET password = 'Flugel' 
WHERE id = 1;

-- Verify the update
SELECT password FROM admin_config WHERE id = 1;
