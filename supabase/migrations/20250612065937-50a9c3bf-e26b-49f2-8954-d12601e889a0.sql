
-- Fix existing form fields that have empty field_name values
-- This will auto-generate proper field names from existing field labels
UPDATE form_fields 
SET field_name = CASE 
    WHEN field_name = '' OR field_name IS NULL THEN
        LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(field_label, '[^a-zA-Z0-9\s]', '', 'g'),
                '\s+', '_', 'g'
            )
        )
    ELSE field_name
END
WHERE field_name = '' OR field_name IS NULL;

-- Add a constraint to prevent empty field names in the future
ALTER TABLE form_fields 
ADD CONSTRAINT field_name_not_empty 
CHECK (field_name IS NOT NULL AND field_name != '');
