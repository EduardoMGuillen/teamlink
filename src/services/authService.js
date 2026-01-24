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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Crear perfil en la tabla users con todos los campos
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: userData.name || data.user.email?.split('@')[0],
          username: userData.username || data.user.email?.split('@')[0],
          phone: userData.phone || null,
          date_of_birth: userData.date_of_birth || null,
          country: userData.country || null,
          city: userData.city || null,
          timezone: userData.timezone || null,
          gender: userData.gender || null,
          role: userData.role || 'employee',
          department: userData.department || 'Operations',
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Try to get more details about the error
        console.error('Profile error details:', JSON.stringify(profileError, null, 2));
        // Return error so user knows what happened
        return { 
          success: false, 
          error: profileError.message || 'Error creating user profile. Please contact support.' 
        };
      }

      return {
        success: true,
        user: {
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
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
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
