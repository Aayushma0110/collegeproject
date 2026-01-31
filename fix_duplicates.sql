-- Remove duplicate symptoms, keeping only the first occurrence
DELETE FROM "Symptom" a USING (
  SELECT MIN(id) as id, name
  FROM "Symptom"
  GROUP BY name
  HAVING COUNT(*) > 1
) b
WHERE a.name = b.name AND a.id <> b.id;

-- Verify no duplicates remain
SELECT name, COUNT(*) as count
FROM "Symptom"
GROUP BY name
HAVING COUNT(*) > 1;
