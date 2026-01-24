import { supabase } from '../config/supabase';

export const shiftsService = {
  // Obtener todos los turnos del usuario
  async getShifts(userId) {
    try {
      // Validate UUID format
      if (!userId || typeof userId !== 'string') {
        console.error('Invalid userId:', userId);
        return [];
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error('Invalid UUID format:', userId);
        return [];
      }

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', userId)
        .order('clock_in', { ascending: false });

      if (error) {
        console.error('Error fetching shifts:', error);
        return [];
      }

      return data.map(shift => ({
        id: shift.id.toString(),
        clockIn: new Date(shift.clock_in),
        clockOut: shift.clock_out ? new Date(shift.clock_out) : null,
        location: shift.location,
        duration: shift.duration || null,
      }));
    } catch (error) {
      console.error('Get shifts error:', error);
      return [];
    }
  },

  // Crear nuevo turno (clock in)
  async clockIn(userId, location) {
    try {
      // Validate UUID format
      if (!userId || typeof userId !== 'string') {
        console.error('Invalid userId:', userId);
        return { success: false, error: 'Invalid user ID' };
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error('Invalid UUID format:', userId);
        return { success: false, error: 'Invalid user ID format' };
      }

      // Verificar que el usuario esté autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('No active session:', sessionError);
        return { success: false, error: 'User not authenticated. Please log in again.' };
      }

      // Verificar que el userId coincida con el usuario autenticado
      if (session.user.id !== userId) {
        console.error('User ID mismatch:', session.user.id, userId);
        return { success: false, error: 'User ID does not match authenticated user' };
      }

      const { data, error } = await supabase
        .from('shifts')
        .insert({
          user_id: userId,
          clock_in: new Date().toISOString(),
          location: location,
        })
        .select()
        .single();

      if (error) {
        console.error('Error clocking in:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        shift: {
          id: data.id.toString(),
          clockIn: new Date(data.clock_in),
          location: data.location,
        },
      };
    } catch (error) {
      console.error('Clock in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar turno (clock out)
  async clockOut(shiftId) {
    try {
      // Primero obtener el turno para calcular la duración
      const { data: shift, error: fetchError } = await supabase
        .from('shifts')
        .select('clock_in')
        .eq('id', shiftId)
        .single();

      if (fetchError) {
        console.error('Error fetching shift:', fetchError);
        return { success: false, error: fetchError.message };
      }

      const clockIn = new Date(shift.clock_in);
      const clockOut = new Date();
      const duration = (clockOut - clockIn) / (1000 * 60 * 60); // horas

      const { data, error } = await supabase
        .from('shifts')
        .update({
          clock_out: clockOut.toISOString(),
          duration: duration.toFixed(2),
        })
        .eq('id', shiftId)
        .select()
        .single();

      if (error) {
        console.error('Error clocking out:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        shift: {
          id: data.id.toString(),
          clockIn: new Date(data.clock_in),
          clockOut: new Date(data.clock_out),
          location: data.location,
          duration: data.duration,
        },
      };
    } catch (error) {
      console.error('Clock out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener turno activo (sin clock out)
  async getActiveShift(userId) {
    try {
      // Validate UUID format
      if (!userId || typeof userId !== 'string') {
        console.error('Invalid userId:', userId);
        return null;
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error('Invalid UUID format:', userId);
        return null;
      }

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', userId)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active shift found
          return null;
        }
        console.error('Error fetching active shift:', error);
        return null;
      }

      return {
        id: data.id.toString(),
        clockIn: new Date(data.clock_in),
        location: data.location,
      };
    } catch (error) {
      console.error('Get active shift error:', error);
      return null;
    }
  },

  // Obtener horas trabajadas en la semana
  async getWeeklyHours(userId) {
    try {
      // Validate UUID format
      if (!userId || typeof userId !== 'string') {
        console.error('Invalid userId:', userId);
        return 0;
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error('Invalid UUID format:', userId);
        return 0;
      }

      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('shifts')
        .select('duration')
        .eq('user_id', userId)
        .gte('clock_in', thisWeekStart.toISOString())
        .not('clock_out', 'is', null);

      if (error) {
        console.error('Error fetching weekly hours:', error);
        return 0;
      }

      const totalHours = data.reduce((sum, shift) => {
        return sum + (parseFloat(shift.duration) || 0);
      }, 0);

      return totalHours;
    } catch (error) {
      console.error('Get weekly hours error:', error);
      return 0;
    }
  },
};
