-- ============================================
-- Fix: team_join_requests_user_id_fkey violation
-- ============================================
-- El error ocurre cuando user_id no existe en public.users.
-- Ejecuta este script en Supabase SQL Editor para crear perfiles
-- de todos los que están en auth pero no en public.users.

-- Rellenar public.users con usuarios de auth.users que aún no tienen fila
INSERT INTO public.users (
  id,
  email,
  name,
  username,
  phone,
  date_of_birth,
  country,
  city,
  timezone,
  gender,
  role,
  department
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'phone',
  (au.raw_user_meta_data->>'date_of_birth')::DATE,
  au.raw_user_meta_data->>'country',
  au.raw_user_meta_data->>'city',
  au.raw_user_meta_data->>'timezone',
  au.raw_user_meta_data->>'gender',
  COALESCE(au.raw_user_meta_data->>'role', 'employee'),
  COALESCE(au.raw_user_meta_data->>'department', 'Operations')
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;
