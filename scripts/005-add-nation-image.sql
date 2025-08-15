-- Add nation_image_url column to items table
ALTER TABLE items ADD COLUMN nation_image_url TEXT;

-- Update existing items to have null nation_image_url (optional)
UPDATE items SET nation_image_url = NULL WHERE nation_image_url IS NULL;
