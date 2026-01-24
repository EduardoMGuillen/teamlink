-- ============================================
-- Fix: Política RLS para calendar_events
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase para corregir el error RLS

-- Eliminar las políticas existentes si ya existen
DROP POLICY IF EXISTS "Users can view own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON calendar_events;

-- Crear las políticas de RLS para calendar_events
-- Esta política permite que los usuarios inserten sus propios eventos del calendario
CREATE POLICY "Users can insert own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Verificar que RLS esté habilitado
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
