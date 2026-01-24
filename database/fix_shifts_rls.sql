-- ============================================
-- Fix: Política RLS para shifts
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase para corregir el error RLS

-- Eliminar la política existente si ya existe
DROP POLICY IF EXISTS "Users can insert own shifts" ON shifts;

-- Crear la política de inserción para shifts
-- Esta política permite que los usuarios inserten sus propios turnos
CREATE POLICY "Users can insert own shifts" ON shifts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verificar que las otras políticas también estén correctas
DROP POLICY IF EXISTS "Users can view own shifts" ON shifts;
CREATE POLICY "Users can view own shifts" ON shifts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own shifts" ON shifts;
CREATE POLICY "Users can update own shifts" ON shifts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own shifts" ON shifts;
CREATE POLICY "Users can delete own shifts" ON shifts
  FOR DELETE USING (auth.uid() = user_id);

-- Verificar que RLS esté habilitado
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
