import { supabase } from '../config/supabase';

const generateTeamCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

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
          team_code: teamData.teamCode || generateTeamCode(),
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
          teamCode: team.team_code,
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
        teamCode: team.team_code,
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

  // Actualizar rol de un miembro del equipo
  async updateMemberRole(teamId, userId, role) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating member role:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        member: data,
      };
    } catch (error) {
      console.error('Update member role error:', error);
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

  // Invitar miembro por email
  async inviteByEmail(teamId, inviterId, email, role = 'member') {
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      if (!teamId || !inviterId || !normalizedEmail) {
        return { success: false, error: 'Invalid data' };
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (userError) {
        console.error('Error searching user by email:', userError);
        return { success: false, error: userError.message };
      }

      const { data: invite, error: inviteError } = await supabase
        .from('team_invites')
        .insert({
          team_id: teamId,
          inviter_id: inviterId,
          invitee_email: normalizedEmail,
          invitee_user_id: user?.id || null,
          role,
          status: 'pending',
        })
        .select()
        .single();

      if (inviteError) {
        console.error('Error creating team invite:', inviteError);
        return { success: false, error: inviteError.message };
      }

      if (user?.id) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'team_invite',
          title: 'Team invitation',
          message: 'You have a team invitation pending.',
          related_id: invite.id,
        });
      }

      return { success: true, inviteId: invite.id };
    } catch (error) {
      console.error('Invite by email error:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener invitaciones pendientes para el usuario
  async getPendingInvites(email, userId) {
    try {
      if (!email && !userId) return [];
      const { data, error } = await supabase
        .from('team_invites')
        .select(`
          id,
          status,
          role,
          created_at,
          team_id,
          teams (
            id,
            name,
            description
          ),
          inviter:users!team_invites_inviter_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('status', 'pending')
        .or(`invitee_email.eq.${email},invitee_user_id.eq.${userId}`);

      if (error) {
        console.error('Error fetching invites:', error);
        return [];
      }

      return data.map(invite => ({
        id: invite.id,
        role: invite.role,
        createdAt: invite.created_at,
        team: invite.teams,
        inviter: invite.inviter,
      }));
    } catch (error) {
      console.error('Get invites error:', error);
      return [];
    }
  },

  async acceptInvite(inviteId, teamId, userId, role = 'member') {
    try {
      const { error: updateError } = await supabase
        .from('team_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (updateError) {
        console.error('Error accepting invite:', updateError);
        return { success: false, error: updateError.message };
      }

      return await this.addMember(teamId, userId, role);
    } catch (error) {
      console.error('Accept invite error:', error);
      return { success: false, error: error.message };
    }
  },

  async declineInvite(inviteId) {
    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) {
        console.error('Error declining invite:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Decline invite error:', error);
      return { success: false, error: error.message };
    }
  },

  // Solicitar unirse por código
  async requestJoinByCode(teamCode, userId) {
    try {
      const code = teamCode?.trim();
      if (!code || !userId) {
        return { success: false, error: 'Invalid data' };
      }

      // Usar función RPC para buscar equipo por código (bypass RLS)
      const { data: teamId, error: teamError } = await supabase.rpc(
        'get_team_id_by_code',
        { team_code_param: code }
      );

      if (teamError) {
        const msg =
          teamError.message && /function.*does not exist/i.test(teamError.message)
            ? 'Team code search is not set up. Ask your admin to run the database migration (fix_team_code_search.sql) in Supabase.'
            : teamError.message;
        return { success: false, error: msg };
      }
      if (!teamId) {
        return { success: false, error: 'Team not found' };
      }

      const { error: requestError } = await supabase
        .from('team_join_requests')
        .insert({
          team_id: teamId,
          user_id: userId,
          status: 'pending',
        });

      if (requestError) {
        console.error('Error creating join request:', requestError);
        let msg = requestError.message;
        if (requestError.code === '23505') {
          msg = 'You already have a pending request for this team.';
        } else if (requestError.code === '23503' && /user_id_fkey/i.test(requestError.message || '')) {
          msg = 'Your profile is not set up in the database. Ask your admin to run fix_team_join_requests_user_fkey.sql in Supabase, or try logging out and back in.';
        }
        return { success: false, error: msg };
      }

      return { success: true, teamId: teamId };
    } catch (error) {
      console.error('Request join error:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener solicitudes pendientes
  async getJoinRequests(teamId) {
    try {
      // Intentar primero sin join: evita que un embed fallido (RLS/relación) deje la lista vacía
      const { data: dataSimple, error: errSimple } = await supabase
        .from('team_join_requests')
        .select('id, status, created_at, user_id')
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (errSimple) {
        console.error('Error fetching join requests:', errSimple);
        return [];
      }
      if (!dataSimple?.length) {
        return [];
      }

      // Opcional: intentar cargar nombres con join; si falla, la lista ya tiene id/user_id
      const { data: dataWithUsers } = await supabase
        .from('team_join_requests')
        .select(`
          id,
          user_id,
          users ( id, name, email )
        `)
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const byId = (dataWithUsers || []).reduce((acc, row) => {
        acc[row.id] = row.users ?? row.user ?? null;
        return acc;
      }, {});

      return dataSimple.map(item => {
        const usr = byId[item.id] ?? null;
        return {
          id: item.id,
          userId: item.user_id,
          createdAt: item.created_at,
          user: usr
            ? { id: usr.id, name: usr.name, email: usr.email }
            : { id: item.user_id, name: null, email: null },
        };
      });
    } catch (error) {
      console.error('Get join requests error:', error);
      return [];
    }
  },

  // Aprobar solicitud: agregar como miembro primero, luego marcar approved
  async approveJoinRequest(requestId, teamId, userId) {
    try {
      const addResult = await this.addMember(teamId, userId, 'member');
      if (!addResult.success) {
        const alreadyMember = addResult.error && /unique|duplicate|23505/i.test(addResult.error);
        if (!alreadyMember) {
          return addResult;
        }
      }

      const { error: updateError } = await supabase
        .from('team_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error approving join request:', updateError);
        return { success: false, error: updateError.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Approve join request error:', error);
      return { success: false, error: error.message };
    }
  },

  // Rechazar solicitud
  async rejectJoinRequest(requestId) {
    try {
      const { error } = await supabase
        .from('team_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting join request:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Reject join request error:', error);
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
            manager_id,
            team_code
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
        teamCode: item.teams.team_code,
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
          users ( id, name, email, phone, department, role, avatar_url )
        `)
        .eq('team_id', teamId);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }
      if (!data?.length) return [];

      const u = (item) => item.users ?? item.user ?? null;
      return data.map(item => {
        const usr = u(item);
        return {
          userId: item.user_id,
          role: item.role,
          joinedAt: item.joined_at,
          user: usr
            ? {
                id: usr.id,
                name: usr.name,
                email: usr.email,
                phone: usr.phone,
                department: usr.department,
                role: usr.role,
                avatar_url: usr.avatar_url,
              }
            : {
                id: item.user_id,
                name: null,
                email: null,
                phone: null,
                department: null,
                role: null,
              },
        };
      });
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
