-- ============================================
-- Fix: Team Members muestra 0 – ver perfiles de miembros del mismo equipo
-- ============================================
-- RLS en users solo permite ver el propio perfil. Al hacer team_members → users,
-- no se podía leer el perfil de otros miembros y la lista fallaba o salía vacía.
-- Esta política permite leer perfiles de usuarios que comparten equipo contigo.
-- Ejecuta en Supabase SQL Editor.

DROP POLICY IF EXISTS "Users can view same-team member profiles" ON users;
CREATE POLICY "Users can view same-team member profiles" ON users
  FOR SELECT USING (
    id IN (
      SELECT tm2.user_id
      FROM team_members tm1
      JOIN team_members tm2 ON tm2.team_id = tm1.team_id
      WHERE tm1.user_id = auth.uid()
    )
  );
