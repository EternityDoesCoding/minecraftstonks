-- Added webhook configuration table
CREATE TABLE IF NOT EXISTS webhook_config (
  id SERIAL PRIMARY KEY,
  webhook_url TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  events JSONB NOT NULL DEFAULT '{"newTrade": true, "tradeAccepted": true, "tradeDeclined": true, "newItem": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO webhook_config (webhook_url, enabled, events) 
VALUES ('', false, '{"newTrade": true, "tradeAccepted": true, "tradeDeclined": true, "newItem": true}')
ON CONFLICT DO NOTHING;
