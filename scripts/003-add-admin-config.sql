-- Create admin configuration table for password storage
CREATE TABLE IF NOT EXISTS admin_config (
  id SERIAL PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default password
INSERT INTO admin_config (password) VALUES ('Flugel') ON CONFLICT DO NOTHING;
