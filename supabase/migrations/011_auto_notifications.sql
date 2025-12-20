-- Automatic notifications for new messages and package status updates
-- This migration is additive and idempotent

CREATE OR REPLACE FUNCTION public.fn_notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user uuid;
  notif_id uuid;
BEGIN
  -- Admin -> notify package client
  IF NEW.sender_role = 'admin' THEN
    SELECT client_id INTO target_user FROM public.packages WHERE id = NEW.package_id;
    IF target_user IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, package_id, type, title, content, is_read)
      VALUES (
        target_user,
        NEW.package_id,
        'new_message',
        'Nouveau message',
        'Vous avez reçu un nouveau message',
        false
      ) RETURNING id INTO notif_id;

      IF to_regclass('public.user_notifications') IS NOT NULL THEN
        INSERT INTO public.user_notifications(notification_id, user_id, status)
        VALUES (notif_id, target_user, 'unread') ON CONFLICT DO NOTHING;
      END IF;
    END IF;

  -- Client -> notify all admins
  ELSIF NEW.sender_role = 'client' THEN
    FOR target_user IN
      SELECT id FROM public.profiles WHERE role = 'admin'
    LOOP
      INSERT INTO public.notifications(user_id, package_id, type, title, content, is_read)
      VALUES (
        target_user,
        NEW.package_id,
        'new_message',
        'Nouveau message',
        'Vous avez reçu un nouveau message',
        false
      ) RETURNING id INTO notif_id;

      IF to_regclass('public.user_notifications') IS NOT NULL THEN
        INSERT INTO public.user_notifications(notification_id, user_id, status)
        VALUES (notif_id, target_user, 'unread') ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_notify_on_new_message ON public.messages;
CREATE TRIGGER trg_notify_on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.fn_notify_on_new_message();

-- Status update notifications
CREATE OR REPLACE FUNCTION public.fn_notify_on_status_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notif_id uuid;
  v_tracking text;
  v_label text;
  v_next text;
  v_when text;
  v_content text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT tracking_number INTO v_tracking FROM public.packages WHERE id = NEW.id;
    v_label := CASE NEW.status
      WHEN 'received_china' THEN 'Reçu en Chine'
      WHEN 'in_transit' THEN 'En transit'
      WHEN 'arrived_africa' THEN 'Arrivé en Afrique'
      WHEN 'available_warehouse' THEN 'Disponible à l''entrepôt'
      WHEN 'picked_up' THEN 'Récupéré'
      ELSE COALESCE(NEW.status, 'Mis à jour')
    END;
    v_next := CASE NEW.status
      WHEN 'received_china' THEN 'Préparation en cours'
      WHEN 'in_transit' THEN 'Prochaine: arrivée en Afrique'
      WHEN 'arrived_africa' THEN 'Prochaine: disponible à l''entrepôt'
      WHEN 'available_warehouse' THEN 'Prochaine: retrait'
      WHEN 'picked_up' THEN 'Fin: colis récupéré'
      ELSE ''
    END;
    v_when := to_char(NOW(), 'DD/MM/YYYY HH24:MI');
    v_content := 'Statut de votre colis (numéro de suivi: ' || v_tracking || '): ' || v_label || ' • ' || v_when;
    IF char_length(v_next) > 0 THEN
      v_content := v_content || ' • ' || v_next;
    END IF;
    IF char_length(v_content) > 160 THEN
      v_content := substring(v_content from 1 for 157) || '...';
    END IF;

    INSERT INTO public.notifications(user_id, package_id, type, title, content, is_read)
    VALUES (
      NEW.client_id,
      NEW.id,
      'status_updated',
      'Suivi colis',
      v_content,
      false
    ) RETURNING id INTO notif_id;

    IF to_regclass('public.user_notifications') IS NOT NULL THEN
      INSERT INTO public.user_notifications(notification_id, user_id, status)
      VALUES (notif_id, NEW.client_id, 'unread') ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_notify_on_status_update ON public.packages;
CREATE TRIGGER trg_notify_on_status_update
AFTER UPDATE OF status ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.fn_notify_on_status_update();

-- Ensure these tables emit realtime updates for clients
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
  END IF;
END$$;

NOTIFY pgrst, 'reload schema';
