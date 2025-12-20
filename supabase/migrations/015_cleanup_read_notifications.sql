-- Enable pg_cron and implement 24h cleanup for read notifications
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Trigger to set read_at automatically when status transitions to 'read'
CREATE OR REPLACE FUNCTION public.fn_set_read_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'read' AND (OLD.status IS DISTINCT FROM NEW.status) AND NEW.read_at IS NULL THEN
    NEW.read_at := NOW();
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_set_read_at ON public.user_notifications;
CREATE TRIGGER trg_set_read_at
BEFORE UPDATE ON public.user_notifications
FOR EACH ROW
EXECUTE FUNCTION public.fn_set_read_at();

CREATE INDEX IF NOT EXISTS idx_user_notifications_read_at ON public.user_notifications(read_at);

-- Cleanup procedure: delete read notifications older than 24h, preserving important ones
CREATE OR REPLACE FUNCTION public.fn_cleanup_read_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_notifications u
  USING public.notifications n
  WHERE u.notification_id = n.id
    AND u.status = 'read'
    AND u.read_at IS NOT NULL
    AND u.read_at < NOW() - INTERVAL '24 hours'
    AND COALESCE(n.priority, 'medium') <> 'high'
    AND COALESCE(n.type, '') <> 'urgent';
END$$;

-- Schedule hourly cleanup via pg_cron (idempotent)
DO $$
DECLARE
  existing_job_id integer;
BEGIN
  SELECT jobid INTO existing_job_id FROM cron.job WHERE jobname = 'cleanup_read_notifications_every_hour';
  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;
  PERFORM cron.schedule('cleanup_read_notifications_every_hour', '0 * * * *', 'SELECT public.fn_cleanup_read_notifications();');
END$$;

NOTIFY pgrst, 'reload schema';
