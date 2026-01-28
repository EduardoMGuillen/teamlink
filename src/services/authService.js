import { supabase } from '../config/supabase';

export const authService = {
  // Login con email y password
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Obtener información del usuario desde la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        // Si no existe en la tabla users, crear un perfil básico
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.email?.split('@')[0] || 'User',
            role: 'employee',
            department: 'Operations',
          },
        };
      }

      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.email?.split('@')[0],
          username: userData.username,
          phone: userData.phone,
          date_of_birth: userData.date_of_birth,
          country: userData.country,
          city: userData.city,
          timezone: userData.timezone,
          gender: userData.gender,
          role: userData.role || 'employee',
          department: userData.department || 'Operations',
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Registro de nuevo usuario
  async signUp(email, password, userData = {}) {
    try {
      // Primero, crear el usuario en auth.users con metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || email?.split('@')[0],
            username: userData.username || email?.split('@')[0],
            phone: userData.phone,
            date_of_birth: userData.date_of_birth,
            country: userData.country,
            city: userData.city,
            timezone: userData.timezone,
            gender: userData.gender,
            role: userData.role || 'employee',
            department: userData.department || 'Operations',
          },
        },
      });

      if (error) {
        // Si es error de rate limit, sugerir deshabilitar confirmación de email
        if (error.message.includes('rate limit') || error.message.includes('email rate limit')) {
          return { 
            success: false, 
            error: 'Email rate limit exceeded. Please:\n1. Wait 1 hour, OR\n2. Disable email confirmation in Supabase Dashboard:\n   Authentication → Settings → Email Auth → Disable "Enable email confirmations"\n\nAlternatively, try logging in if the account already exists.' 
          };
        }
        
        // Si el usuario ya existe, intentar login automáticamente
        if (error.message.includes('already registered') || 
            error.message.includes('already exists') ||
            error.message.includes('User already registered')) {
          // Intentar hacer login en su lugar
          const loginResult = await this.login(email, password);
          if (loginResult.success) {
            return { 
              ...loginResult, 
              message: 'Account already exists. Logged in successfully.' 
            };
          }
          return { 
            success: false, 
            error: 'This email is already registered. Please try logging in instead.' 
          };
        }
        
        // Para otros errores, retornar el mensaje
        return { success: false, error: error.message };
      }

      // Si no hay usuario (por confirmación de email), retornar éxito de todas formas
      // El usuario puede hacer login después
      if (!data.user) {
        return { 
          success: true, 
          user: {
            email: email,
            name: userData.name || email?.split('@')[0],
            message: 'Registration successful. Please check your email to confirm your account, or disable email confirmation in Supabase settings for instant access.'
          }
        };
      }

      // Esperar un momento para que el trigger cree el perfil (si existe)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Intentar obtener el perfil
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      let finalProfile = existingProfile;

      // Si no existe, intentar crearlo (el trigger debería hacerlo, pero por si acaso)
      if (!finalProfile) {
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          name: userData.name || data.user.email?.split('@')[0],
          username: userData.username || data.user.email?.split('@')[0],
          role: userData.role || 'employee',
          department: userData.department || 'Operations',
        };

        // Agregar campos opcionales solo si tienen valor
        if (userData.phone) profileData.phone = userData.phone;
        if (userData.date_of_birth) profileData.date_of_birth = userData.date_of_birth;
        if (userData.country) profileData.country = userData.country;
        if (userData.city) profileData.city = userData.city;
        if (userData.timezone) profileData.timezone = userData.timezone;
        if (userData.gender) profileData.gender = userData.gender;

        const { data: insertedProfile, error: profileError } = await supabase
          .from('users')
          .insert(profileData)
          .select()
          .single();

        // Si hay error de RLS, no importa - el trigger lo creará o el usuario puede actualizar después
        if (!profileError && insertedProfile) {
          finalProfile = insertedProfile;
        }
      }

      return {
        success: true,
        user: finalProfile || {
          id: data.user.id,
          email: data.user.email,
          name: userData.name || data.user.email?.split('@')[0],
          username: userData.username,
          phone: userData.phone,
          date_of_birth: userData.date_of_birth,
          country: userData.country,
          city: userData.city,
          timezone: userData.timezone,
          gender: userData.gender,
          role: userData.role || 'employee',
          department: userData.department || 'Operations',
        },
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Obtener información del usuario desde la tabla users
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return {
          id: user.id,
          email: user.email,
          name: user.email?.split('@')[0] || 'User',
          role: 'employee',
          department: 'Operations',
        };
      }

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name || user.email?.split('@')[0],
        username: userData.username,
        phone: userData.phone,
        date_of_birth: userData.date_of_birth,
        country: userData.country,
        city: userData.city,
        timezone: userData.timezone,
        gender: userData.gender,
        role: userData.role || 'employee',
        department: userData.department || 'Operations',
        avatar_url: userData.avatar_url || null,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Subir foto de perfil y devolver URL pública
  async uploadAvatar(userId, photoUri, mimeType = null) {
    try {
      let ext = 'jpg';
      let contentType = 'image/jpeg';
      if (mimeType?.includes('png')) {
        ext = 'png';
        contentType = 'image/png';
      } else if (mimeType?.includes('heic') || mimeType?.includes('heif')) {
        ext = 'heic';
        contentType = 'image/heic';
      }
      const fileName = `avatars/${userId}.${ext}`;
      const response = await fetch(photoUri);
      const fileBody = await response.blob();
      const { error } = await supabase.storage
        .from('team-files')
        .upload(fileName, fileBody, { contentType, upsert: true });
      if (error) {
        console.error('Error uploading avatar:', error);
        return null;
      }
      const { data: urlData } = supabase.storage.from('team-files').getPublicUrl(fileName);
      return urlData?.publicUrl || null;
    } catch (err) {
      console.error('uploadAvatar error:', err);
      return null;
    }
  },

  // Actualizar perfil en public.users
  async updateProfile(userId, fields) {
    try {
      const allowed = ['name', 'username', 'phone', 'department', 'avatar_url', 'city', 'country', 'timezone'];
      const payload = {};
      for (const k of allowed) {
        if (fields[k] !== undefined) payload[k] = fields[k] === '' ? null : fields[k];
      }
      if (Object.keys(payload).length === 0) return { success: true, user: null };
      const { data, error } = await supabase
        .from('users')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) {
        console.error('updateProfile error:', error);
        return { success: false, error: error.message };
      }
      return {
        success: true,
        user: {
          id: data.id,
          email: data.email,
          name: data.name,
          username: data.username,
          phone: data.phone,
          department: data.department,
          avatar_url: data.avatar_url,
          city: data.city,
          country: data.country,
          timezone: data.timezone,
          role: data.role,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
        },
      };
    } catch (err) {
      console.error('updateProfile error:', err);
      return { success: false, error: err.message };
    }
  },

  // Verificar sesión activa
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },
};
