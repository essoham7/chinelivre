-- Delay "new_message" notifications by 1 minute; send only if message stays unread
CREATE TABLE IF NOT EXISTS public.pending_message_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  target_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL DEFAULT (NOW() + INTERVAL '1 minute'),
  processed boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_msg_notif_due ON public.pending_message_notifications(scheduled_at) WHERE processed = FALSE;

-- Replace immediate notification trigger with enqueue logic
CREATE OR REPLACE FUNCTION public.fn_notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user uuid;
  v_tracking text;
BEGIN
  IF NEW.sender_role = 'admin' THEN
    SELECT client_id, tracking_number INTO target_user, v_tracking FROM public.packages WHERE id = NEW.package_id;
    IF target_user IS NOT NULL THEN
      INSERT INTO public.pending_message_notifications(message_id, target_user, package_id)
      VALUES (NEW.id, target_user, NEW.package_id);
    END IF;

  ELSIF NEW.sender_role = 'client' THEN
    FOR target_user IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
      INSERT INTO public.pending_message_notifications(message_id, target_user, package_id)
      VALUES (NEW.id, target_user, NEW.package_id);
    END LOOP;
  END IF;

  RETURN NEW;
END$$;

-- Processor: send notifications for due pending items only if message is still unread
CREATE OR REPLACE FUNCTION public.fn_process_pending_message_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  v_is_read boolean;
  v_tracking text;
  v_when text;
  v_content text;
  notif_id uuid;
BEGIN
  FOR rec IN
    SELECT p.* FROM public.pending_message_notifications p
    WHERE p.processed = FALSE AND p.scheduled_at <= NOW()
  LOOP
    SELECT is_read INTO v_is_read FROM public.messages WHERE id = rec.message_id;
    IF v_is_read IS NULL THEN
      -- Message deleted or not found; mark processed to avoid loops
      UPDATE public.pending_message_notifications SET processed = TRUE WHERE id = rec.id;
      CONTINUE;
    END IF;

    IF v_is_read = FALSE THEN
      SELECT tracking_number INTO v_tracking FROM public.packages WHERE id = rec.package_id;
      v_when := to_char(NOW(), 'DD/MM/YYYY HH24:MI');
      v_content := 'Nouveau message concernant le colis (numéro de suivi: ' || v_tracking || ') • ' || v_when;
      IF char_length(v_content) > 160 THEN
        v_content := substring(v_content from 1 for 157) || '...';
      END IF;

      INSERT INTO public.notifications(user_id, package_id, type, title, content, is_read)
      VALUES (
        rec.target_user,
        rec.package_id,
        'new_message',
        'Message colis',
        v_content,
        FALSE
      ) RETURNING id INTO notif_id;

      IF to_regclass('public.user_notifications') IS NOT NULL THEN
        INSERT INTO public.user_notifications(notification_id, user_id, status)
        VALUES (notif_id, rec.target_user, 'unread') ON CONFLICT DO NOTHING;
      END IF;
    END IF;

    UPDATE public.pending_message_notifications SET processed = TRUE WHERE id = rec.id;
  END LOOP;
END$$;

-- Schedule processing every minute via pg_cron
DO $$
DECLARE
  existing_job_id integer;
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  SELECT jobid INTO existing_job_id FROM cron.job WHERE jobname = 'process_pending_message_notifications_every_minute';
  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;
  PERFORM cron.schedule('process_pending_message_notifications_every_minute', '* * * * *', 'SELECT public.fn_process_pending_message_notifications();');
END$$;

NOTIFY pgrst, 'reload schema';
