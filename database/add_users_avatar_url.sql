-- ============================================
-- Migración: Foto de perfil (users.avatar_url)
-- ============================================
-- Necesario para que "Editar perfil" guarde la foto en la base de datos.
-- Ejecuta TODO este archivo en Supabase SQL Editor.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.users.avatar_url IS 'URL pública de la foto de perfil (Storage, team-files/avatars/)';
