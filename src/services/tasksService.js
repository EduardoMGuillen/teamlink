import { supabase } from '../config/supabase';

export const tasksService = {
  // Obtener todas las tareas del usuario (incluyendo asignadas y de equipo)
  async getTasks(userId) {
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

      // Obtener tareas asignadas al usuario O tareas de equipo donde el usuario es miembro
      // Por ahora, solo obtenemos las asignadas directamente (RLS manejará el resto)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      return data.map(task => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        dueDate: new Date(task.due_date),
        status: task.status,
        priority: task.priority,
        assignedBy: task.assigned_by,
        teamId: task.team_id,
        isTeamTask: task.is_team_task,
        created_at: task.created_at,
      }));
    } catch (error) {
      console.error('Get tasks error:', error);
      return [];
    }
  },

  // Crear nueva tarea
  async createTask(userId, taskData) {
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

      const insertData = {
        user_id: taskData.assignedTo || userId,
        title: taskData.title,
        description: taskData.description || null,
        due_date: taskData.dueDate.toISOString(),
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
      };

      // Si se asigna a otro usuario, agregar assigned_by
      if (taskData.assignedTo && taskData.assignedTo !== userId) {
        insertData.assigned_by = userId;
      }

      // Si es tarea de equipo
      if (taskData.teamId) {
        insertData.team_id = taskData.teamId;
        insertData.is_team_task = true;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        task: {
          id: data.id.toString(),
          title: data.title,
          description: data.description,
          dueDate: new Date(data.due_date),
          status: data.status,
          priority: data.priority,
          assignedBy: data.assigned_by,
          teamId: data.team_id,
          isTeamTask: data.is_team_task,
        },
      };
    } catch (error) {
      console.error('Create task error:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar tarea
  async updateTask(taskId, taskData) {
    try {
      const updateData = {};
      if (taskData.title) updateData.title = taskData.title;
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.dueDate) updateData.due_date = taskData.dueDate.toISOString();
      if (taskData.status) updateData.status = taskData.status;
      if (taskData.priority) updateData.priority = taskData.priority;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        task: {
          id: data.id.toString(),
          title: data.title,
          description: data.description,
          dueDate: new Date(data.due_date),
          status: data.status,
          priority: data.priority,
        },
      };
    } catch (error) {
      console.error('Update task error:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar tarea
  async deleteTask(taskId) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete task error:', error);
      return { success: false, error: error.message };
    }
  },
};
