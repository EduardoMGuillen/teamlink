import { supabase } from '../config/supabase';

export const schedulesService = {
  // Obtener todos los schedules del usuario
  async getSchedules(userId) {
    try {
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
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching schedules:', error);
        return [];
      }

      return data.map(schedule => ({
        id: schedule.id.toString(),
        date: schedule.date,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        location: schedule.location,
        position: schedule.position || 'Operations',
      }));
    } catch (error) {
      console.error('Get schedules error:', error);
      return [];
    }
  },

  // Crear nuevo schedule
  async createSchedule(userId, scheduleData) {
    try {
      if (!userId || typeof userId !== 'string') {
        return { success: false, error: 'Invalid user ID' };
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return { success: false, error: 'Invalid user ID format' };
      }

      const { data, error } = await supabase
        .from('schedules')
        .insert({
          user_id: userId,
          date: scheduleData.date,
          start_time: scheduleData.startTime,
          end_time: scheduleData.endTime,
          location: scheduleData.location,
          position: scheduleData.position || 'Operations',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        schedule: {
          id: data.id.toString(),
          date: data.date,
          startTime: data.start_time,
          endTime: data.end_time,
          location: data.location,
          position: data.position,
        },
      };
    } catch (error) {
      console.error('Create schedule error:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar schedule
  async updateSchedule(scheduleId, scheduleData) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          date: scheduleData.date,
          start_time: scheduleData.startTime,
          end_time: scheduleData.endTime,
          location: scheduleData.location,
          position: scheduleData.position,
        })
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating schedule:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        schedule: {
          id: data.id.toString(),
          date: data.date,
          startTime: data.start_time,
          endTime: data.end_time,
          location: data.location,
          position: data.position,
        },
      };
    } catch (error) {
      console.error('Update schedule error:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar schedule
  async deleteSchedule(scheduleId) {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) {
        console.error('Error deleting schedule:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete schedule error:', error);
      return { success: false, error: error.message };
    }
  },
};
