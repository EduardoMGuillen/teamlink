import { supabase } from '../config/supabase';

export const updatesService = {
  // Obtener actualizaciones del equipo
  async getTeamUpdates(teamId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select(`
          *,
          author:users!updates_author_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('team_id', teamId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching team updates:', error);
        return [];
      }

      return data.map(update => ({
        id: update.id,
        authorId: update.author_id,
        authorName: update.author?.name || 'Unknown',
        authorEmail: update.author?.email || '',
        title: update.title,
        content: update.content,
        priority: update.priority,
        isPinned: update.is_pinned,
        createdAt: new Date(update.created_at),
        updatedAt: new Date(update.updated_at),
      }));
    } catch (error) {
      console.error('Get team updates error:', error);
      return [];
    }
  },

  // Obtener todas las actualizaciones (globales y de equipos del usuario)
  async getAllUpdates(userId, limit = 20) {
    try {
      // Primero obtener los equipos del usuario
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);

      const teamIds = teamMembers?.map(tm => tm.team_id) || [];

      let query = supabase
        .from('updates')
        .select(`
          *,
          author:users!updates_author_id_fkey (
            id,
            name,
            email
          )
        `)
        .or(`team_id.is.null,team_id.in.(${teamIds.length > 0 ? teamIds.join(',') : 'null'})`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching all updates:', error);
        return [];
      }

      return data.map(update => ({
        id: update.id,
        authorId: update.author_id,
        authorName: update.author?.name || 'Unknown',
        authorEmail: update.author?.email || '',
        teamId: update.team_id,
        title: update.title,
        content: update.content,
        priority: update.priority,
        isPinned: update.is_pinned,
        createdAt: new Date(update.created_at),
        updatedAt: new Date(update.updated_at),
      }));
    } catch (error) {
      console.error('Get all updates error:', error);
      return [];
    }
  },

  // Crear actualización
  async createUpdate(authorId, updateData) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!authorId || !uuidRegex.test(authorId)) {
        return { success: false, error: 'Invalid user ID' };
      }

      const { data, error } = await supabase
        .from('updates')
        .insert({
          author_id: authorId,
          team_id: updateData.teamId || null,
          title: updateData.title.trim(),
          content: updateData.content.trim(),
          priority: updateData.priority || 'normal',
          is_pinned: updateData.isPinned || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating update:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        update: {
          id: data.id,
          title: data.title,
          content: data.content,
          createdAt: new Date(data.created_at),
        },
      };
    } catch (error) {
      console.error('Create update error:', error);
      return { success: false, error: error.message };
    }
  },
};
