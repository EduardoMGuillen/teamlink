import { supabase } from '../config/supabase';

export const teamsService = {
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
