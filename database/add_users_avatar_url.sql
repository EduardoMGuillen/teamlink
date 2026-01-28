-- Añadir columna avatar_url a users para foto de perfil
-- Ejecuta en Supabase SQL Editor

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.users.avatar_url IS 'URL pública de la foto de perfil (Storage)';
