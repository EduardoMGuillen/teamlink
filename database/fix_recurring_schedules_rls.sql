-- ============================================
-- Fix: Política RLS para recurring_schedules
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase para corregir el error RLS

-- Eliminar las políticas existentes si ya existen
DROP POLICY IF EXISTS "Users can view own recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Users can insert own recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Users can update own recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Users can delete own recurring schedules" ON recurring_schedules;

-- Crear las políticas de RLS para recurring_schedules
-- Esta política permite que los usuarios inserten sus propios horarios recurrentes
CREATE POLICY "Users can insert own recurring schedules" ON recurring_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own recurring schedules" ON recurring_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring schedules" ON recurring_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring schedules" ON recurring_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Verificar que RLS esté habilitado
ALTER TABLE recurring_schedules ENABLE ROW LEVEL SECURITY;
