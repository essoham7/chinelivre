-- Allow authenticated users to insert notifications they create via app flows
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert notifications by authenticated"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);
