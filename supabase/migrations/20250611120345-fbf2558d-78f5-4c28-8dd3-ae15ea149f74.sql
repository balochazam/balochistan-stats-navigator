
-- Add status column to schedules table
ALTER TABLE public.schedules 
ADD COLUMN status text NOT NULL DEFAULT 'open' 
CHECK (status IN ('open', 'collection', 'published'));

-- Add a comment to document the status meanings
COMMENT ON COLUMN public.schedules.status IS 'open: can add/remove forms, collection: forms locked but can collect data, published: data collection complete';
