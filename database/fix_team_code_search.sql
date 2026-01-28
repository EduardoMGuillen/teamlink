-- Fix: Permitir búsqueda de equipos por código sin restricciones RLS
-- Esto permite que usuarios que no son miembros puedan buscar equipos por código para unirse

-- Función para buscar team_id por código (bypass RLS)
CREATE OR REPLACE FUNCTION get_team_id_by_code(team_code_param TEXT)
RETURNS UUID
AS $$
DECLARE
  team_id_result UUID;
BEGIN
  SELECT id INTO team_id_result
  FROM teams
  WHERE UPPER(TRIM(team_code)) = UPPER(TRIM(team_code_param))
  LIMIT 1;
  
  RETURN team_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario explicativo
COMMENT ON FUNCTION get_team_id_by_code IS 'Allows any authenticated user to find a team by code for join requests, bypassing RLS restrictions';
