-- ============================================
-- Fix: Permitir inserción de perfil durante registro
-- ============================================
-- Ejecuta este script COMPLETO en el SQL Editor de Supabase para corregir el error RLS

-- SOLUCIÓN RECOMENDADA: Crear un trigger que automáticamente cree el perfil
-- cuando se crea un usuario en auth.users
-- Esto es más seguro y garantiza que el perfil siempre se cree con privilegios elevados

-- Función para crear perfil automáticamente (usa SECURITY DEFINER para bypass RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    username, 
    phone,
    date_of_birth,
    country,
    city,
    timezone,
    gender,
    role, 
    department
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'timezone',
    NEW.raw_user_meta_data->>'gender',
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Operations')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, users.name),
    username = COALESCE(EXCLUDED.username, users.username),
    phone = COALESCE(EXCLUDED.phone, users.phone),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, users.date_of_birth),
    country = COALESCE(EXCLUDED.country, users.country),
    city = COALESCE(EXCLUDED.city, users.city),
    timezone = COALESCE(EXCLUDED.timezone, users.timezone),
    gender = COALESCE(EXCLUDED.gender, users.gender),
    role = COALESCE(EXCLUDED.role, users.role),
    department = COALESCE(EXCLUDED.department, users.department);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta cuando se crea un nuevo usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- También actualizar la política para permitir inserción manual como respaldo
-- (aunque el trigger debería manejar esto automáticamente)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verificar que el trigger se creó correctamente
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
