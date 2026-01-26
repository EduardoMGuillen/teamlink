import { supabase } from '../config/supabase';

export const tasksService = {
  toLocalDateMiddayISO(dateInput) {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
      const localMidday = new Date(
        dateInput.getFullYear(),
        dateInput.getMonth(),
        dateInput.getDate(),
        12,
        0,
        0,
        0
      );
      return localMidday.toISOString();
    }
    if (typeof dateInput === 'string') {
      const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateInput);
      if (dateOnlyMatch) {
        const [year, month, day] = dateInput.split('-').map(Number);
        const localMidday = new Date(year, month - 1, day, 12, 0, 0, 0);
        return localMidday.toISOString();
      }
    }
    return new Date(dateInput).toISOString();
  },

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

      // Obtener tareas individuales del usuario
      const { data: individualTasks, error: individualError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .or('is_team_task.is.null,is_team_task.eq.false')
        .order('created_at', { ascending: false });

      if (individualError) {
        console.error('Error fetching individual tasks:', individualError);
      }

      // Obtener team tasks asignadas al usuario
      const { data: teamTasks, error: teamError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_team_task', true)
        .order('created_at', { ascending: false });

      if (teamError) {
        console.error('Error fetching team tasks:', teamError);
      }

      // Combinar ambas listas
      const allTasks = [
        ...(individualTasks || []),
        ...(teamTasks || [])
      ];

      // Eliminar duplicados por ID (por si acaso)
      const uniqueTasks = Array.from(
        new Map(allTasks.map(task => [task.id, task])).values()
      );

      return uniqueTasks.map(task => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        dueDate: new Date(task.due_date),
        status: task.status,
        priority: task.priority,
        assignedBy: task.assigned_by,
        teamId: task.team_id,
        isTeamTask: task.is_team_task || false,
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
        due_date: this.toLocalDateMiddayISO(taskData.dueDate),
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
      if (taskData.dueDate) updateData.due_date = this.toLocalDateMiddayISO(taskData.dueDate);
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

  // Obtener tareas del equipo
  async getTeamTasks(teamId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!tasks_user_id_fkey(id, name, email),
          assigned_by_user:users!tasks_assigned_by_fkey(id, name, email)
        `)
        .eq('team_id', teamId)
        .eq('is_team_task', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team tasks:', error);
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
        assignedByUser: task.assigned_by_user,
        assignedTo: task.user_id,
        assignedUser: task.assigned_user,
        teamId: task.team_id,
        isTeamTask: task.is_team_task,
        created_at: task.created_at,
        // Una tarea está sin asignar si no tiene assigned_by (fue creada sin asignar)
        isUnassigned: !task.assigned_by,
      }));
    } catch (error) {
      console.error('Get team tasks error:', error);
      return [];
    }
  },

  // Crear tarea del equipo (puede estar sin asignar)
  async createTeamTask(teamId, creatorId, taskData) {
    try {
      const insertData = {
        team_id: teamId,
        is_team_task: true,
        title: taskData.title,
        description: taskData.description || null,
        due_date: this.toLocalDateMiddayISO(taskData.dueDate),
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
      };

      // Si se asigna a alguien, usar ese user_id y assigned_by
      if (taskData.assignedTo) {
        insertData.user_id = taskData.assignedTo;
        insertData.assigned_by = creatorId;
      } else {
        // Para tareas sin asignar, usamos el creatorId como user_id temporal
        // pero NO ponemos assigned_by, así sabemos que está sin asignar
        // Cuando alguien la tome, actualizamos user_id y ponemos assigned_by
        insertData.user_id = creatorId;
        // No ponemos assigned_by para indicar que está sin asignar
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(insertData)
        .select(`
          *,
          assigned_user:users!tasks_user_id_fkey(id, name, email),
          assigned_by_user:users!tasks_assigned_by_fkey(id, name, email)
        `)
        .single();

      if (error) {
        console.error('Error creating team task:', error);
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
          assignedByUser: data.assigned_by_user,
          assignedTo: data.user_id,
          assignedUser: data.assigned_user,
          teamId: data.team_id,
          isTeamTask: data.is_team_task,
          isUnassigned: !data.assigned_by,
        },
      };
    } catch (error) {
      console.error('Create team task error:', error);
      return { success: false, error: error.message };
    }
  },

  // Tomar una tarea sin asignar (claim)
  async claimTask(taskId, userId) {
    try {
      // Primero verificar que la tarea existe y está sin asignar
      const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (fetchError || !task) {
        return { success: false, error: 'Task not found' };
      }

      // Una tarea está sin asignar si no tiene assigned_by
      if (task.assigned_by) {
        return { success: false, error: 'Task is already assigned' };
      }

      // Asignar la tarea al usuario y poner assigned_by al creador original (user_id actual)
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          user_id: userId,
          assigned_by: task.user_id, // El creador original
        })
        .eq('id', taskId)
        .select(`
          *,
          assigned_user:users!tasks_user_id_fkey(id, name, email),
          assigned_by_user:users!tasks_assigned_by_fkey(id, name, email)
        `)
        .single();

      if (error) {
        console.error('Error claiming task:', error);
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
          assignedByUser: data.assigned_by_user,
          assignedTo: data.user_id,
          assignedUser: data.assigned_user,
          teamId: data.team_id,
          isTeamTask: data.is_team_task,
          isUnassigned: !data.assigned_by,
        },
      };
    } catch (error) {
      console.error('Claim task error:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener estadísticas del equipo
  async getTeamStats(teamId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('status, user_id')
        .eq('team_id', teamId)
        .eq('is_team_task', true);

      if (error) {
        console.error('Error fetching team stats:', error);
        return { pending: 0, inProgress: 0, completed: 0, unassigned: 0 };
      }

      const stats = {
        pending: 0,
        inProgress: 0,
        completed: 0,
        unassigned: 0,
      };

      data.forEach(task => {
        // Una tarea está sin asignar si no tiene assigned_by
        if (!task.assigned_by) {
          stats.unassigned++;
        } else {
          if (task.status === 'pending') stats.pending++;
          else if (task.status === 'inProgress') stats.inProgress++;
          else if (task.status === 'completed') stats.completed++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Get team stats error:', error);
      return { pending: 0, inProgress: 0, completed: 0, unassigned: 0 };
    }
  },

  // Obtener leaderboard del equipo
  async getTeamLeaderboard(teamId, period = 'month') {
    try {
      const now = new Date();
      let startDate;
      
      if (period === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        startDate = new Date(0); // All time
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('user_id, status')
        .eq('team_id', teamId)
        .eq('is_team_task', true)
        .eq('status', 'completed')
        .gte('updated_at', startDate.toISOString());

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      // Contar tareas completadas por usuario
      const userCounts = {};
      data.forEach(task => {
        if (task.user_id) {
          userCounts[task.user_id] = (userCounts[task.user_id] || 0) + 1;
        }
      });

      // Obtener información de usuarios
      const userIds = Object.keys(userCounts);
      if (userIds.length === 0) return [];

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return [];
      }

      // Crear leaderboard
      const leaderboard = users.map(user => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        completedTasks: userCounts[user.id] || 0,
      }));

      // Ordenar por tareas completadas
      leaderboard.sort((a, b) => b.completedTasks - a.completedTasks);

      return leaderboard;
    } catch (error) {
      console.error('Get team leaderboard error:', error);
      return [];
    }
  },
};
