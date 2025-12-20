-- Format explicite des notifications de messages (client/admin) avec numéro de suivi et horodatage
CREATE OR REPLACE FUNCTION public.fn_notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user uuid;
  notif_id uuid;
  v_tracking text;
  v_when text;
  v_content text;
BEGIN
  IF NEW.sender_role = 'admin' THEN
    SELECT client_id, tracking_number INTO target_user, v_tracking FROM public.packages WHERE id = NEW.package_id;
    IF target_user IS NOT NULL THEN
      v_when := to_char(NOW(), 'DD/MM/YYYY HH24:MI');
      v_content := 'Nouveau message de l''administration concernant votre colis (numéro de suivi: ' || v_tracking || ') • ' || v_when;
      IF char_length(v_content) > 160 THEN
        v_content := substring(v_content from 1 for 157) || '...';
      END IF;

      INSERT INTO public.notifications(user_id, package_id, type, title, content, is_read)
      VALUES (
        target_user,
        NEW.package_id,
        'new_message',
        'Message colis',
        v_content,
        false
      ) RETURNING id INTO notif_id;

      IF to_regclass('public.user_notifications') IS NOT NULL THEN
        INSERT INTO public.user_notifications(notification_id, user_id, status)
        VALUES (notif_id, target_user, 'unread') ON CONFLICT DO NOTHING;
      END IF;
    END IF;

  ELSIF NEW.sender_role = 'client' THEN
    SELECT tracking_number INTO v_tracking FROM public.packages WHERE id = NEW.package_id;
    v_when := to_char(NOW(), 'DD/MM/YYYY HH24:MI');
    v_content := 'Nouveau message du client concernant le colis (numéro de suivi: ' || v_tracking || ') • ' || v_when;
    IF char_length(v_content) > 160 THEN
      v_content := substring(v_content from 1 for 157) || '...';
    END IF;

    FOR target_user IN
      SELECT id FROM public.profiles WHERE role = 'admin'
    LOOP
      INSERT INTO public.notifications(user_id, package_id, type, title, content, is_read)
      VALUES (
        target_user,
        NEW.package_id,
        'new_message',
        'Message colis',
        v_content,
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

NOTIFY pgrst, 'reload schema';
