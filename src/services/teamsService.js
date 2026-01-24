import { supabase } from '../config/supabase';

export const teamsService = {
  // Crear un equipo y asignar manager
  async createTeam(managerId, teamData) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!managerId || !uuidRegex.test(managerId)) {
        return { success: false, error: 'Invalid user ID' };
      }

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamData.name?.trim(),
          description: teamData.description?.trim() || '',
          department: teamData.department?.trim() || '',
          manager_id: managerId,
        })
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        return { success: false, error: teamError.message };
      }

      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: managerId,
          role: 'manager',
        });

      if (memberError) {
        console.error('Error adding manager to team:', memberError);
        return { success: false, error: memberError.message };
      }

      return {
        success: true,
        team: {
          id: team.id,
          name: team.name,
          description: team.description,
          department: team.department,
          managerId: team.manager_id,
        },
      };
    } catch (error) {
      console.error('Create team error:', error);
      return { success: false, error: error.message };
    }
  },

  // Buscar equipos por nombre
  async searchTeams(query) {
    try {
      if (!query?.trim()) return [];

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .ilike('name', `%${query.trim()}%`)
        .order('name', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error searching teams:', error);
        return [];
      }

      return data.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        department: team.department,
        managerId: team.manager_id,
      }));
    } catch (error) {
      console.error('Search teams error:', error);
      return [];
    }
  },

  // Agregar miembro a un equipo
  async addMember(teamId, userId, role = 'member') {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!teamId || !uuidRegex.test(teamId) || !userId || !uuidRegex.test(userId)) {
        return { success: false, error: 'Invalid ID' };
      }

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
        });

      if (error) {
        console.error('Error adding team member:', error);
        return { success: false, error: error.message };
      }

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'team_invite',
        title: 'Team invitation',
        message: 'You have been added to a team.',
        related_id: teamId,
      });

      return { success: true };
    } catch (error) {
      console.error('Add team member error:', error);
      return { success: false, error: error.message };
    }
  },

  // Remover miembro de un equipo
  async removeMember(teamId, userId) {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing team member:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Remove team member error:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar equipo
  async updateTeam(teamId, teamData) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({
          name: teamData.name?.trim(),
          description: teamData.description?.trim() || '',
          department: teamData.department?.trim() || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) {
        console.error('Error updating team:', error);
        return { success: false, error: error.message };
      }

      return { success: true, team: data };
    } catch (error) {
      console.error('Update team error:', error);
      return { success: false, error: error.message };
    }
  },
  // Obtener todos los equipos del usuario
  async getUserTeams(userId) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!userId || !uuidRegex.test(userId)) {
        return [];
      }

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (
            id,
            name,
            description,
            department,
            manager_id
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user teams:', error);
        return [];
      }

      return data.map(item => ({
        id: item.teams.id,
        name: item.teams.name,
        description: item.teams.description,
        department: item.teams.department,
        managerId: item.teams.manager_id,
        role: item.role,
      }));
    } catch (error) {
      console.error('Get user teams error:', error);
      return [];
    }
  },

  // Obtener miembros de un equipo
  async getTeamMembers(teamId) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          joined_at,
          users (
            id,
            name,
            email,
            phone,
            department,
            role
          )
        `)
        .eq('team_id', teamId);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      return data.map(item => ({
        userId: item.user_id,
        role: item.role,
        joinedAt: item.joined_at,
        user: {
          id: item.users.id,
          name: item.users.name,
          email: item.users.email,
          phone: item.users.phone,
          department: item.users.department,
          role: item.users.role,
        },
      }));
    } catch (error) {
      console.error('Get team members error:', error);
      return [];
    }
  },

  // Obtener todos los usuarios (para directorio)
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching all users:', error);
        return [];
      }

      return data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role,
        country: user.country,
        city: user.city,
      }));
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  },

  // Buscar usuarios
  async searchUsers(query) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: user.role,
      }));
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  },
};
