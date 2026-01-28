-- ============================================
-- Fix: Approved join requests pero usuario no aparece como miembro
-- ============================================
-- Si en team_join_requests hay status='approved' pero no hay fila en team_members,
-- este script agrega esos usuarios como miembros. Ejecuta en Supabase SQL Editor.

INSERT INTO public.team_members (team_id, user_id, role)
SELECT tjr.team_id, tjr.user_id, 'member'
FROM public.team_join_requests tjr
WHERE tjr.status = 'approved'
  AND NOT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = tjr.team_id AND tm.user_id = tjr.user_id
  )
ON CONFLICT (team_id, user_id) DO NOTHING;
