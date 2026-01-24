import { supabase } from '../config/supabase';

export const calendarScheduleService = {
  normalizeDateInput(dateInput) {
    if (dateInput instanceof Date) {
      return new Date(dateInput);
    }
    if (typeof dateInput === 'string') {
      const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateInput);
      if (dateOnlyMatch) {
        const [year, month, day] = dateInput.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
    }
    return new Date(dateInput);
  },

  // ========== RECURRING SCHEDULES ==========
  
  // Obtener todos los horarios recurrentes del usuario
  async getRecurringSchedules(userId) {
    try {
      if (!userId) {
        console.error('Invalid userId for getRecurringSchedules');
        return [];
      }
      const { data, error } = await supabase
        .from('recurring_schedules')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching recurring schedules:', error);
        return [];
      }

      return data.map(schedule => ({
        id: schedule.id,
        userId: schedule.user_id,
        title: schedule.title,
        description: schedule.description,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        location: schedule.location,
        position: schedule.position,
        days: {
          monday: schedule.monday,
          tuesday: schedule.tuesday,
          wednesday: schedule.wednesday,
          thursday: schedule.thursday,
          friday: schedule.friday,
          saturday: schedule.saturday,
          sunday: schedule.sunday,
        },
        createdAt: new Date(schedule.created_at),
        updatedAt: new Date(schedule.updated_at),
      }));
    } catch (error) {
      console.error('Get recurring schedules error:', error);
      return [];
    }
  },

  // Crear un nuevo horario recurrente
  async createRecurringSchedule(scheduleData) {
    try {
      // Verificar que el usuario esté autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('No active session:', sessionError);
        return { success: false, error: 'User not authenticated. Please log in again.' };
      }

      // Verificar que el userId coincida con el usuario autenticado
      if (session.user.id !== scheduleData.userId) {
        console.error('User ID mismatch:', session.user.id, scheduleData.userId);
        return { success: false, error: 'User ID does not match authenticated user' };
      }

      const { data, error } = await supabase
        .from('recurring_schedules')
        .insert({
          user_id: scheduleData.userId,
          title: scheduleData.title,
          description: scheduleData.description || null,
          start_time: scheduleData.startTime,
          end_time: scheduleData.endTime,
          location: scheduleData.location || null,
          position: scheduleData.position || null,
          monday: scheduleData.days.monday || false,
          tuesday: scheduleData.days.tuesday || false,
          wednesday: scheduleData.days.wednesday || false,
          thursday: scheduleData.days.thursday || false,
          friday: scheduleData.days.friday || false,
          saturday: scheduleData.days.saturday || false,
          sunday: scheduleData.days.sunday || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating recurring schedule:', error);
        return { success: false, error: error.message };
      }

      return { success: true, schedule: data };
    } catch (error) {
      console.error('Create recurring schedule error:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar un horario recurrente
  async updateRecurringSchedule(scheduleId, scheduleData) {
    try {
      const { data, error } = await supabase
        .from('recurring_schedules')
        .update({
          title: scheduleData.title,
          description: scheduleData.description || null,
          start_time: scheduleData.startTime,
          end_time: scheduleData.endTime,
          location: scheduleData.location || null,
          position: scheduleData.position || null,
          monday: scheduleData.days.monday || false,
          tuesday: scheduleData.days.tuesday || false,
          wednesday: scheduleData.days.wednesday || false,
          thursday: scheduleData.days.thursday || false,
          friday: scheduleData.days.friday || false,
          saturday: scheduleData.days.saturday || false,
          sunday: scheduleData.days.sunday || false,
        })
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating recurring schedule:', error);
        return { success: false, error: error.message };
      }

      return { success: true, schedule: data };
    } catch (error) {
      console.error('Update recurring schedule error:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar un horario recurrente
  async deleteRecurringSchedule(scheduleId) {
    try {
      const { error } = await supabase
        .from('recurring_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) {
        console.error('Error deleting recurring schedule:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete recurring schedule error:', error);
      return { success: false, error: error.message };
    }
  },

  // ========== CALENDAR EVENTS ==========

  // Obtener eventos del calendario para un rango de fechas
  async getCalendarEvents(userId, startDate, endDate) {
    try {
      if (!userId) {
        console.error('Invalid userId for getCalendarEvents');
        return [];
      }
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDate.toISOString())
        .lte('end_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
      }

      return data.map(event => ({
        id: event.id,
        userId: event.user_id,
        title: event.title,
        description: event.description,
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time),
        location: event.location,
        isAllDay: event.is_all_day,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at),
      }));
    } catch (error) {
      console.error('Get calendar events error:', error);
      return [];
    }
  },

  // Obtener eventos del día actual
  async getTodayEvents(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getCalendarEvents(userId, today, tomorrow);
  },

  // Crear un nuevo evento del calendario
  async createCalendarEvent(eventData) {
    try {
      // Verificar que el usuario esté autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('No active session:', sessionError);
        return { success: false, error: 'User not authenticated. Please log in again.' };
      }

      // Verificar que el userId coincida con el usuario autenticado
      if (session.user.id !== eventData.userId) {
        console.error('User ID mismatch:', session.user.id, eventData.userId);
        return { success: false, error: 'User ID does not match authenticated user' };
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: eventData.userId,
          title: eventData.title,
          description: eventData.description || null,
          start_time: eventData.startTime.toISOString(),
          end_time: eventData.endTime.toISOString(),
          location: eventData.location || null,
          is_all_day: eventData.isAllDay || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating calendar event:', error);
        return { success: false, error: error.message };
      }

      return { success: true, event: data };
    } catch (error) {
      console.error('Create calendar event error:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar un evento del calendario
  async updateCalendarEvent(eventId, eventData) {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: eventData.title,
          description: eventData.description || null,
          start_time: eventData.startTime.toISOString(),
          end_time: eventData.endTime.toISOString(),
          location: eventData.location || null,
          is_all_day: eventData.isAllDay || false,
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        console.error('Error updating calendar event:', error);
        return { success: false, error: error.message };
      }

      return { success: true, event: data };
    } catch (error) {
      console.error('Update calendar event error:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar un evento del calendario
  async deleteCalendarEvent(eventId) {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting calendar event:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete calendar event error:', error);
      return { success: false, error: error.message };
    }
  },

  // ========== CONFLICT CHECKING ==========

  // Verificar si hay conflictos entre un evento y los horarios recurrentes
  async checkScheduleConflict(userId, startTime, endTime) {
    try {
      const eventDate = new Date(startTime);
      const dayOfWeek = eventDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      
      // Obtener todos los horarios recurrentes
      const recurringSchedules = await this.getRecurringSchedules(userId);
      
      // Verificar si el día de la semana tiene un horario recurrente
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek];
      
      const conflictingSchedules = recurringSchedules.filter(schedule => {
        if (!schedule.days[dayName]) return false;
        
        // Convertir tiempos a minutos para comparar
        const eventStart = this.timeToMinutes(startTime);
        const eventEnd = this.timeToMinutes(endTime);
        const scheduleStart = this.timeToMinutes(schedule.startTime);
        const scheduleEnd = this.timeToMinutes(schedule.endTime);
        
        // Verificar solapamiento
        return (eventStart < scheduleEnd && eventEnd > scheduleStart);
      });
      
      return conflictingSchedules;
    } catch (error) {
      console.error('Check schedule conflict error:', error);
      return [];
    }
  },

  // Helper: convertir tiempo a minutos desde medianoche
  timeToMinutes(time) {
    if (time instanceof Date) {
      return time.getHours() * 60 + time.getMinutes();
    }
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  // Obtener todas las actividades para una fecha específica (recurrentes + eventos)
  async getActivitiesForDate(userId, date) {
    try {
      const dateObj = this.normalizeDateInput(date);
      const dayOfWeek = dateObj.getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek];
      
      // Obtener horarios recurrentes para este día
      const recurringSchedules = await this.getRecurringSchedules(userId);
      const daySchedules = recurringSchedules.filter(s => s.days[dayName]);
      
      // Obtener eventos individuales para este día
      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);
      
      const events = await this.getCalendarEvents(userId, startOfDay, endOfDay);
      
      // Combinar y formatear
      const activities = [];
      
      daySchedules.forEach(schedule => {
        activities.push({
          id: `recurring-${schedule.id}`,
          type: 'recurring',
          title: schedule.title,
          description: schedule.description,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          location: schedule.location,
          position: schedule.position,
        });
      });
      
      events.forEach(event => {
        activities.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
        });
      });
      
      // Ordenar por hora de inicio
      activities.sort((a, b) => {
        const aTime = this.timeToMinutes(a.startTime);
        const bTime = this.timeToMinutes(b.startTime);
        return aTime - bTime;
      });
      
      return activities;
    } catch (error) {
      console.error('Get activities for date error:', error);
      return [];
    }
  },
};
