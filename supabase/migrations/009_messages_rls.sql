-- RLS pour la table messages: lecture/écriture par client du colis et admin
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Nettoyage
DROP POLICY IF EXISTS "Messages select client/admin" ON public.messages;
DROP POLICY IF EXISTS "Messages insert client/admin" ON public.messages;
DROP POLICY IF EXISTS "Client/Admin peuvent mettre is_read" ON public.messages;

-- SELECT: le client du colis ou un admin peut lire les messages du colis
CREATE POLICY "Messages select client/admin" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = messages.package_id
        AND (
          p.client_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles pr
            WHERE pr.id = auth.uid() AND pr.role = 'admin'
          )
        )
    )
  );

-- INSERT: le client du colis ou un admin peut envoyer un message
CREATE POLICY "Messages insert client/admin" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = messages.package_id
        AND (
          p.client_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles pr
            WHERE pr.id = auth.uid() AND pr.role = 'admin'
          )
        )
    )
  );

-- UPDATE: le client du colis ou un admin peut mettre is_read
CREATE POLICY "Client/Admin peuvent mettre is_read" ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = messages.package_id
        AND (
          p.client_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles pr
            WHERE pr.id = auth.uid() AND pr.role = 'admin'
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = messages.package_id
        AND (
          p.client_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.profiles pr
            WHERE pr.id = auth.uid() AND pr.role = 'admin'
          )
        )
    )
  );

-- GRANT (RLS reste prioritaire)
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- Rafraîchir le cache de PostgREST pour REST/Realtime
NOTIFY pgrst, 'reload schema';
