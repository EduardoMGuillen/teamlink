-- ============================================
-- Fix: Mostrar nombre del solicitante en Join Requests
-- ============================================
-- Los managers solo podían ver su propio perfil en users (RLS).
-- Sin esta política, el join team_join_requests -> users devuelve null para name/email
-- y en la app aparece "User" en lugar del nombre real.
--
-- Ejecuta este script en Supabase SQL Editor.

-- Permitir a managers ver el perfil (id, name, email) de usuarios que tienen
-- una solicitud pendiente en un equipo donde ellos son miembros
DROP POLICY IF EXISTS "Managers can view join requesters profile" ON users;
CREATE POLICY "Managers can view join requesters profile" ON users
  FOR SELECT USING (
    id IN (
      SELECT tjr.user_id
      FROM team_join_requests tjr
      WHERE tjr.status = 'pending'
        AND tjr.team_id IN (SELECT team_id FROM get_user_teams(auth.uid()))
    )
  );
