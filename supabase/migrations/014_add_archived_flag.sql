ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_packages_archived ON public.packages(archived);

UPDATE public.packages
SET archived = TRUE
WHERE status = 'picked_up'
  AND updated_at < NOW() - INTERVAL '15 days'
  AND archived = FALSE;

NOTIFY pgrst, 'reload schema';
