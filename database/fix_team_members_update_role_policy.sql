-- ============================================
-- Fix: Permitir a managers/leads actualizar el rol
--      de los miembros de su equipo (team_members.role)
--
-- Contexto:
-- - El cliente permite que haya varios managers por equipo.
-- - Desde la pantalla Team Members, un manager/lead puede
--   cambiar el rol de otros usuarios entre: member, lead, manager.
-- - Para que el UPDATE en team_members funcione con RLS,
--   se necesita una política FOR UPDATE.
--
-- Importante:
-- - Esta política permite que cualquier usuario que sea
--   manager/lead de un team_id pueda actualizar la fila
--   de ese team_id en team_members.
-- - La UI evita que un usuario cambie su PROPIO rol, para
--   no dejar el equipo sin managers por accidente.
--
-- Ejecutar en Supabase SQL Editor una sola vez.
-- ============================================

DROP POLICY IF EXISTS "Managers and leads can update member roles" ON team_members;

CREATE POLICY "Managers and leads can update member roles"
ON team_members
FOR UPDATE
USING (
  team_id IN (
    SELECT tm.team_id
    FROM team_members tm
    WHERE tm.user_id = auth.uid()
      AND tm.role IN ('manager', 'lead')
  )
)
WITH CHECK (
  team_id IN (
    SELECT tm.team_id
    FROM team_members tm
    WHERE tm.user_id = auth.uid()
      AND tm.role IN ('manager', 'lead')
  )
);

