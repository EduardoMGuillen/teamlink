-- ============================================
-- Fix: Corregir política RLS para insertar tareas
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase para corregir el error RLS

-- Eliminar la política problemática
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;

-- Crear nueva política que permite:
-- 1. Insertar tareas propias (auth.uid() = user_id)
-- 2. Insertar tareas asignadas a otros usuarios (auth.uid() = assigned_by)
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid() = assigned_by
  );

-- Verificar que la política se creó correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tasks' AND policyname = 'Users can insert own tasks';
