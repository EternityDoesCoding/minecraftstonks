-- Create nations table for managing different nations/countries
CREATE TABLE IF NOT EXISTS nations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  flag_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster nation lookups
CREATE INDEX IF NOT EXISTS idx_nations_name ON nations(name);

-- Insert some default nations
INSERT INTO nations (name, description) VALUES 
  ('Unassigned', 'Items not assigned to any specific nation')
ON CONFLICT (name) DO NOTHING;
