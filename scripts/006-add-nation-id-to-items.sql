-- Add nation_id column to items table to link items with nations
ALTER TABLE items ADD COLUMN IF NOT EXISTS nation_id INTEGER;

-- Add foreign key constraint to link items with nations
ALTER TABLE items ADD CONSTRAINT fk_items_nation_id 
  FOREIGN KEY (nation_id) REFERENCES nations(id) ON DELETE SET NULL;

-- Create index for faster nation-based item lookups
CREATE INDEX IF NOT EXISTS idx_items_nation_id ON items(nation_id);

-- Set default nation for existing items (Unassigned nation)
UPDATE items 
SET nation_id = (SELECT id FROM nations WHERE name = 'Unassigned' LIMIT 1)
WHERE nation_id IS NULL;
