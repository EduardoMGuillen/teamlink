-- TeamLink Team Collaboration Schema
-- Ejecuta estos comandos en el SQL Editor de Supabase DESPUÉS del schema.sql principal

-- Tabla de equipos/departamentos
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  manager_id UUID REFERENCES users(id),
  team_code TEXT UNIQUE,
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

-- Tabla de solicitudes de ingreso
CREATE TABLE IF NOT EXISTS team_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_join_requests_team_id ON team_join_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_team_join_requests_user_id ON team_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_messages_team_id ON messages(team_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_updates_team_id ON updates(team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Row Level Security (RLS) Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para evitar recursión en policies
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE(team_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT tm.team_id
  FROM team_members tm
  WHERE tm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para teams: los usuarios pueden ver equipos de los que son miembros
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
CREATE POLICY "Users can view their teams" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
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

-- Políticas para team_members: los usuarios pueden ver miembros de sus equipos
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
CREATE POLICY "Users can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own team membership" ON team_members;
CREATE POLICY "Users can view own team membership" ON team_members
  FOR SELECT USING (user_id = auth.uid());

-- Políticas para team_join_requests
DROP POLICY IF EXISTS "Users can create join requests" ON team_join_requests;
CREATE POLICY "Users can create join requests" ON team_join_requests
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can view their join requests" ON team_join_requests;
CREATE POLICY "Users can view their join requests" ON team_join_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('manager', 'lead')
    )
  );

DROP POLICY IF EXISTS "Managers can update join requests" ON team_join_requests;
CREATE POLICY "Managers can update join requests" ON team_join_requests
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('manager', 'lead')
    )
  );

-- Políticas para messages: los usuarios pueden ver mensajes de sus equipos o mensajes directos
DROP POLICY IF EXISTS "Users can view team messages" ON messages;
CREATE POLICY "Users can view team messages" ON messages
  FOR SELECT USING (
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    ))
    OR sender_id = auth.uid()
    OR recipient_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Políticas para updates: los usuarios pueden ver actualizaciones de sus equipos
DROP POLICY IF EXISTS "Users can view team updates" ON updates;
CREATE POLICY "Users can view team updates" ON updates
  FOR SELECT USING (
    team_id IS NULL OR team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    )
  );

-- Políticas para notifications: los usuarios solo pueden ver sus propias notificaciones
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Actualizar políticas de tasks para permitir ver tareas del equipo
DROP POLICY IF EXISTS "Users can view team tasks" ON tasks;
CREATE POLICY "Users can view team tasks" ON tasks
  FOR SELECT USING (
    user_id = auth.uid()
    OR assigned_by = auth.uid()
    OR (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    ))
  );

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

-- Trigger para notificaciones de tareas
DROP TRIGGER IF EXISTS task_assigned_notification ON tasks;
CREATE TRIGGER task_assigned_notification
  AFTER INSERT ON tasks
  FOR EACH ROW
  WHEN (NEW.assigned_by IS NOT NULL)
  EXECUTE FUNCTION notify_team_members();

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_updates_updated_at ON updates;
CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
