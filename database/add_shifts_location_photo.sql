-- ============================================
-- Migración: Agregar geolocalización y foto a shifts
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar campos de geolocalización
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Agregar campo para URL de foto
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Agregar comentarios para documentación
COMMENT ON COLUMN shifts.latitude IS 'Latitud GPS del check-in';
COMMENT ON COLUMN shifts.longitude IS 'Longitud GPS del check-in';
COMMENT ON COLUMN shifts.photo_url IS 'URL de la foto capturada al check-in (almacenada en Supabase Storage)';

-- Los campos son opcionales (NULL permitido) para mantener compatibilidad con shifts existentes
