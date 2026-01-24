-- ============================================
-- TeamLink - Esquema Completo de Base de Datos
-- ============================================
-- Ejecuta este archivo COMPLETO en el SQL Editor de Supabase
-- IMPORTANTE: Ejecuta primero el schema.sql principal, luego este archivo

-- ============================================
-- PRELUDE: Migración segura de IDs TEXT -> UUID
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name = 'id'
        AND data_type IN ('text', 'character varying')
    ) THEN
      EXECUTE 'CREATE TABLE IF NOT EXISTS user_id_map (old_id text PRIMARY KEY, new_id uuid NOT NULL)';

      EXECUTE $sql$
        INSERT INTO user_id_map (old_id, new_id)
        SELECT u.id::text, au.id
        FROM users u
        JOIN auth.users au ON au.id::text = u.id::text
        ON CONFLICT (old_id) DO NOTHING
      $sql$;

      EXECUTE $sql$
        INSERT INTO user_id_map (old_id, new_id)
        SELECT u.id, gen_random_uuid()
        FROM users u
        LEFT JOIN user_id_map m ON m.old_id = u.id
        WHERE m.old_id IS NULL
      $sql$;

      EXECUTE 'UPDATE users u SET id = m.new_id::text FROM user_id_map m WHERE u.id = m.old_id';

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''orders'') THEN
        EXECUTE 'ALTER TABLE orders DROP CONSTRAINT IF EXISTS "orders_userId_fkey"';
        EXECUTE 'UPDATE orders o SET "userId" = m.new_id::text FROM user_id_map m WHERE o."userId" = m.old_id';
        EXECUTE 'ALTER TABLE orders ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid';
        EXECUTE 'ALTER TABLE orders ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id)';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''tasks'') THEN
        EXECUTE 'ALTER TABLE tasks DROP CONSTRAINT IF EXISTS "tasks_user_id_fkey"';
        EXECUTE 'UPDATE tasks t SET user_id = m.new_id::text FROM user_id_map m WHERE t.user_id::text = m.old_id';
        EXECUTE 'ALTER TABLE tasks ALTER COLUMN user_id TYPE uuid USING user_id::uuid';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''shifts'') THEN
        EXECUTE 'ALTER TABLE shifts DROP CONSTRAINT IF EXISTS "shifts_user_id_fkey"';
        EXECUTE 'UPDATE shifts s SET user_id = m.new_id::text FROM user_id_map m WHERE s.user_id::text = m.old_id';
        EXECUTE 'ALTER TABLE shifts ALTER COLUMN user_id TYPE uuid USING user_id::uuid';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''schedules'') THEN
        EXECUTE 'ALTER TABLE schedules DROP CONSTRAINT IF EXISTS "schedules_user_id_fkey"';
        EXECUTE 'UPDATE schedules sc SET user_id = m.new_id::text FROM user_id_map m WHERE sc.user_id::text = m.old_id';
        EXECUTE 'ALTER TABLE schedules ALTER COLUMN user_id TYPE uuid USING user_id::uuid';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''team_members'') THEN
        EXECUTE 'ALTER TABLE team_members DROP CONSTRAINT IF EXISTS "team_members_user_id_fkey"';
        EXECUTE 'UPDATE team_members tm SET user_id = m.new_id::text FROM user_id_map m WHERE tm.user_id::text = m.old_id';
        EXECUTE 'ALTER TABLE team_members ALTER COLUMN user_id TYPE uuid USING user_id::uuid';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''messages'') THEN
        EXECUTE 'ALTER TABLE messages DROP CONSTRAINT IF EXISTS "messages_sender_id_fkey"';
        EXECUTE 'ALTER TABLE messages DROP CONSTRAINT IF EXISTS "messages_recipient_id_fkey"';
        EXECUTE 'UPDATE messages m SET sender_id = map.new_id::text FROM user_id_map map WHERE m.sender_id::text = map.old_id';
        EXECUTE 'UPDATE messages m SET recipient_id = map.new_id::text FROM user_id_map map WHERE m.recipient_id::text = map.old_id';
        EXECUTE 'ALTER TABLE messages ALTER COLUMN sender_id TYPE uuid USING sender_id::uuid';
        EXECUTE 'ALTER TABLE messages ALTER COLUMN recipient_id TYPE uuid USING recipient_id::uuid';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''updates'') THEN
        EXECUTE 'ALTER TABLE updates DROP CONSTRAINT IF EXISTS "updates_author_id_fkey"';
        EXECUTE 'UPDATE updates u SET author_id = map.new_id::text FROM user_id_map map WHERE u.author_id::text = map.old_id';
        EXECUTE 'ALTER TABLE updates ALTER COLUMN author_id TYPE uuid USING author_id::uuid';
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''notifications'') THEN
        EXECUTE 'ALTER TABLE notifications DROP CONSTRAINT IF EXISTS "notifications_user_id_fkey"';
        EXECUTE 'UPDATE notifications n SET user_id = map.new_id::text FROM user_id_map map WHERE n.user_id::text = map.old_id';
        EXECUTE 'ALTER TABLE notifications ALTER COLUMN user_id TYPE uuid USING user_id::uuid';
      END IF;

      EXECUTE 'ALTER TABLE users ALTER COLUMN id TYPE uuid USING id::uuid';
    END IF;
  END IF;
END $$;

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

-- Compatibilidad: asegurar tipo UUID si users.id existe como text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'id'
      AND data_type IN ('text', 'character varying')
  ) THEN
    ALTER TABLE users
      ALTER COLUMN id TYPE UUID USING id::uuid;
  END IF;
END $$;

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

-- Tabla de schedules (horarios programados)
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT NOT NULL,
  position TEXT DEFAULT 'Operations',
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

-- Tabla de invitaciones por email
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'lead', 'manager')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, invitee_email)
);

-- ============================================
-- Índices para mejorar el rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_clock_in ON shifts(clock_in);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
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
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(invitee_email);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
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
-- Permitir insertar tareas propias O tareas asignadas a otros (si assigned_by = auth.uid())
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid() = assigned_by
  );

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Función auxiliar para obtener equipos del usuario sin recursión
-- DEBE crearse ANTES de usarse en las políticas RLS
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE(team_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT tm.team_id
  FROM team_members tm
  WHERE tm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Políticas para schedules
DROP POLICY IF EXISTS "Users can view own schedules" ON schedules;
CREATE POLICY "Users can view own schedules" ON schedules
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own schedules" ON schedules;
CREATE POLICY "Users can insert own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own schedules" ON schedules;
CREATE POLICY "Users can update own schedules" ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;
CREATE POLICY "Users can delete own schedules" ON schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para teams
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

-- Políticas para team_members
-- IMPORTANTE: Usar función SECURITY DEFINER para evitar recursión infinita
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can view own team membership" ON team_members;

-- Política: Los usuarios pueden ver miembros de equipos donde ellos son miembros
-- Usamos la función auxiliar para evitar recursión
CREATE POLICY "Users can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    )
  );

-- Política adicional: Los usuarios pueden ver sus propios registros de membresía
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
      SELECT team_id FROM get_user_teams(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Managers can update join requests" ON team_join_requests;
CREATE POLICY "Managers can update join requests" ON team_join_requests
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
    )
  );

-- Políticas para team_invites
DROP POLICY IF EXISTS "Managers can invite by email" ON team_invites;
CREATE POLICY "Managers can invite by email" ON team_invites
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can view invites" ON team_invites;
CREATE POLICY "Users can view invites" ON team_invites
  FOR SELECT USING (
    invitee_email = (SELECT email FROM users WHERE id = auth.uid())
    OR inviter_id = auth.uid()
  );

DROP POLICY IF EXISTS "Invitees can update invites" ON team_invites;
CREATE POLICY "Invitees can update invites" ON team_invites
  FOR UPDATE USING (
    invitee_email = (SELECT email FROM users WHERE id = auth.uid())
    OR inviter_id = auth.uid()
  );

-- Políticas para messages
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

-- Políticas para updates
DROP POLICY IF EXISTS "Users can view team updates" ON updates;
CREATE POLICY "Users can view team updates" ON updates
  FOR SELECT USING (
    team_id IS NULL OR team_id IN (
      SELECT team_id FROM get_user_teams(auth.uid())
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

DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_updates_updated_at ON updates;
CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para notificaciones de tareas
DROP TRIGGER IF EXISTS task_assigned_notification ON tasks;
CREATE TRIGGER task_assigned_notification
  AFTER INSERT ON tasks
  FOR EACH ROW
  WHEN (NEW.assigned_by IS NOT NULL)
  EXECUTE FUNCTION notify_team_members();

-- ============================================
-- Calendar & Schedule Tables
-- ============================================

-- Tabla de horarios recurrentes (recurring schedules)
CREATE TABLE IF NOT EXISTS recurring_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  position TEXT,
  -- Días de la semana: 0=Domingo, 1=Lunes, ..., 6=Sábado
  monday BOOLEAN DEFAULT false,
  tuesday BOOLEAN DEFAULT false,
  wednesday BOOLEAN DEFAULT false,
  thursday BOOLEAN DEFAULT false,
  friday BOOLEAN DEFAULT false,
  saturday BOOLEAN DEFAULT false,
  sunday BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos individuales del calendario
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_user_id ON recurring_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_time ON calendar_events(end_time);

-- Row Level Security (RLS) Policies para recurring_schedules
ALTER TABLE recurring_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recurring schedules" ON recurring_schedules;
CREATE POLICY "Users can view own recurring schedules" ON recurring_schedules
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recurring schedules" ON recurring_schedules;
CREATE POLICY "Users can insert own recurring schedules" ON recurring_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recurring schedules" ON recurring_schedules;
CREATE POLICY "Users can update own recurring schedules" ON recurring_schedules
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recurring schedules" ON recurring_schedules;
CREATE POLICY "Users can delete own recurring schedules" ON recurring_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Row Level Security (RLS) Policies para calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own calendar events" ON calendar_events;
CREATE POLICY "Users can view own calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own calendar events" ON calendar_events;
CREATE POLICY "Users can insert own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own calendar events" ON calendar_events;
CREATE POLICY "Users can update own calendar events" ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own calendar events" ON calendar_events;
CREATE POLICY "Users can delete own calendar events" ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_recurring_schedules_updated_at ON recurring_schedules;
CREATE TRIGGER update_recurring_schedules_updated_at BEFORE UPDATE ON recurring_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
