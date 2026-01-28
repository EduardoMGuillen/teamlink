-- Fix: Permitir búsqueda de equipos por código sin restricciones RLS
-- Ejecutar TODO este archivo en Supabase SQL Editor para que "Join by code" funcione.

-- Función en schema public para buscar team_id por código (bypass RLS)
CREATE OR REPLACE FUNCTION public.get_team_id_by_code(team_code_param TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  team_id_result UUID;
BEGIN
  SELECT id INTO team_id_result
  FROM public.teams
  WHERE UPPER(TRIM(team_code)) = UPPER(TRIM(team_code_param))
  LIMIT 1;
  
  RETURN team_id_result;
END;
$$;

COMMENT ON FUNCTION public.get_team_id_by_code(TEXT) IS 'Allows any authenticated user to find a team by code for join requests, bypassing RLS.';

-- Permisos para que la app pueda llamar la función vía RPC
GRANT EXECUTE ON FUNCTION public.get_team_id_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_id_by_code(TEXT) TO anon;
