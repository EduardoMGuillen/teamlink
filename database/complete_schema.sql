-- ============================================
-- TeamLink - Esquema Completo de Base de Datos
-- ============================================
-- Ejecuta este archivo COMPLETO en el SQL Editor de Supabase
-- IMPORTANTE: Ejecuta primero el schema.sql principal, luego este archivo

-- ============================================
-- PARTE 1: Esquema Base (ya deberías tenerlo)
-- ============================================

-- Tabla de usuarios (extiende auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  country TEXT,
  city TEXT,
  timezone TEXT,
  gender TEXT,
  role TEXT DEFAULT 'employee',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'inProgress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de turnos (shifts)
CREATE TABLE IF NOT EXISTS shifts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  location TEXT NOT NULL,
  duration DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 2: Esquema de Trabajo en Equipo
-- ============================================

-- Tabla de equipos/departamentos
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de miembros de equipo (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'lead', 'manager')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Actualizar tabla tasks para soportar asignación a otros usuarios
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_team_task BOOLEAN DEFAULT false;

-- Tabla de mensajes/chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de actualizaciones/anuncios
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'message', 'update', 'mention', 'team_invite')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- ID de la entidad relacionada (task, message, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Índices para mejorar el rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_clock_in ON shifts(clock_in);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_messages_team_id ON messages(team_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_updates_team_id ON updates(team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Actualizar políticas de tasks para permitir ver tareas del equipo
DROP POLICY IF EXISTS "Users can view team tasks" ON tasks;
CREATE POLICY "Users can view team tasks" ON tasks
  FOR SELECT USING (
    user_id = auth.uid()
    OR assigned_by = auth.uid()
    OR (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ))
  );

-- Políticas para shifts
DROP POLICY IF EXISTS "Users can view own shifts" ON shifts;
CREATE POLICY "Users can view own shifts" ON shifts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own shifts" ON shifts;
CREATE POLICY "Users can insert own shifts" ON shifts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own shifts" ON shifts;
CREATE POLICY "Users can update own shifts" ON shifts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own shifts" ON shifts;
CREATE POLICY "Users can delete own shifts" ON shifts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para teams
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
CREATE POLICY "Users can view their teams" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
    OR manager_id = auth.uid()
  );

DROP POLICY IF EXISTS "Managers can create teams" ON teams;
CREATE POLICY "Managers can create teams" ON teams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- Políticas para team_members
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
CREATE POLICY "Users can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Políticas para messages
DROP POLICY IF EXISTS "Users can view team messages" ON messages;
CREATE POLICY "Users can view team messages" ON messages
  FOR SELECT USING (
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ))
    OR sender_id = auth.uid()
    OR recipient_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Políticas para updates
DROP POLICY IF EXISTS "Users can view team updates" ON updates;
CREATE POLICY "Users can view team updates" ON updates
  FOR SELECT USING (
    team_id IS NULL OR team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Políticas para notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- Funciones y Triggers
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para crear notificaciones automáticas
CREATE OR REPLACE FUNCTION notify_team_members()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar cuando se asigna una tarea
  IF TG_TABLE_NAME = 'tasks' AND NEW.assigned_by IS NOT NULL AND NEW.user_id != NEW.assigned_by THEN
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.user_id,
      'task_assigned',
      'Nueva tarea asignada',
      'Se te ha asignado una nueva tarea: ' || NEW.title,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_updates_updated_at ON updates;
CREATE TRIGGER update_updates_updated_at ON updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para notificaciones de tareas
DROP TRIGGER IF EXISTS task_assigned_notification ON tasks;
CREATE TRIGGER task_assigned_notification
  AFTER INSERT ON tasks
  FOR EACH ROW
  WHEN (NEW.assigned_by IS NOT NULL)
  EXECUTE FUNCTION notify_team_members();
