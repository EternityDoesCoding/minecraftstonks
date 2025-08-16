-- Fix items table to properly support nations
-- This script ensures the nation_id column exists and is properly configured

-- First, check if the column exists and add it if it doesn't
DO $$ 
BEGIN
    -- Add nation_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'nation_id'
    ) THEN
        ALTER TABLE items ADD COLUMN nation_id INTEGER;
    END IF;
END $$;

-- Create nations table if it doesn't exist
CREATE TABLE IF NOT EXISTS nations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    flag_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default "Unassigned" nation if it doesn't exist
INSERT INTO nations (name, description) 
VALUES ('Unassigned', 'Items not assigned to any specific nation')
ON CONFLICT (name) DO NOTHING;

-- Update existing items to have the "Unassigned" nation
UPDATE items 
SET nation_id = (SELECT id FROM nations WHERE name = 'Unassigned' LIMIT 1)
WHERE nation_id IS NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'items_nation_id_fkey'
    ) THEN
        ALTER TABLE items 
        ADD CONSTRAINT items_nation_id_fkey 
        FOREIGN KEY (nation_id) REFERENCES nations(id);
    END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_items_nation_id ON items(nation_id);
