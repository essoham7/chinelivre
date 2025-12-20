-- Re-link packages.client_id to profiles.id for PostgREST embedding
ALTER TABLE public.packages
  DROP CONSTRAINT IF EXISTS packages_client_id_fkey;

ALTER TABLE public.packages
  ADD CONSTRAINT packages_client_profiles_fkey
  FOREIGN KEY (client_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
