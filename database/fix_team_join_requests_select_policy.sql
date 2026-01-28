-- ============================================
-- Fix: Lista de Join Requests vacía para managers/leads
-- ============================================
-- Si "Users can view their join requests" usa get_user_teams() y esa función
-- no existe o falla, la lista sale vacía. Esta política no depende de ella.
-- Ejecuta en Supabase SQL Editor.

DROP POLICY IF EXISTS "Users can view their join requests" ON team_join_requests;
CREATE POLICY "Users can view their join requests" ON team_join_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR team_id IN (
      SELECT tm.team_id
      FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );
