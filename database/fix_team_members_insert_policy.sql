-- ============================================
-- Fix: Permitir a managers/leads agregar miembros al equipo
-- ============================================
-- Sin esta política, Approve en Join Requests falla porque no hay INSERT en team_members.
-- Ejecuta en Supabase SQL Editor.

DROP POLICY IF EXISTS "Managers and leads can add team members" ON team_members;
CREATE POLICY "Managers and leads can add team members" ON team_members
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id
      FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.role IN ('manager', 'lead')
    )
  );
