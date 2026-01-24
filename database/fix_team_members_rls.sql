-- ============================================
-- Fix: Corregir recursión infinita en políticas RLS de team_members
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase para corregir el error de recursión

-- Paso 1: Crear función auxiliar SECURITY DEFINER para evitar recursión
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE(team_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT tm.team_id
  FROM team_members tm
  WHERE tm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 2: Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can view own team membership" ON team_members;

-- Paso 3: Crear nuevas políticas sin recursión
-- Los usuarios pueden ver miembros de equipos donde ellos son miembros
CREATE POLICY "Users can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    )
  );

-- Los usuarios pueden ver sus propios registros de membresía
CREATE POLICY "Users can view own team membership" ON team_members
  FOR SELECT USING (user_id = auth.uid());

-- Paso 4: Actualizar otras políticas que usan team_members
DROP POLICY IF EXISTS "Users can view team tasks" ON tasks;
CREATE POLICY "Users can view team tasks" ON tasks
  FOR SELECT USING (
    user_id = auth.uid()
    OR assigned_by = auth.uid()
    OR (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    ))
  );

DROP POLICY IF EXISTS "Users can view their teams" ON teams;
CREATE POLICY "Users can view their teams" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    )
    OR manager_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can view team messages" ON messages;
CREATE POLICY "Users can view team messages" ON messages
  FOR SELECT USING (
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    ))
    OR sender_id = auth.uid()
    OR recipient_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can view team updates" ON updates;
CREATE POLICY "Users can view team updates" ON updates
  FOR SELECT USING (
    team_id IS NULL OR team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    )
  );

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('team_members', 'tasks', 'teams', 'messages', 'updates')
ORDER BY tablename, policyname;
