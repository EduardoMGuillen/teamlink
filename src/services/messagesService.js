import { supabase } from '../config/supabase';

export const messagesService = {
  // Obtener mensajes de un equipo
  async getTeamMessages(teamId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching team messages:', error);
        return [];
      }

      return data.reverse().map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender?.name || 'Unknown',
        senderEmail: msg.sender?.email || '',
        content: msg.content,
        messageType: msg.message_type,
        isRead: msg.is_read,
        createdAt: new Date(msg.created_at),
      }));
    } catch (error) {
      console.error('Get team messages error:', error);
      return [];
    }
  },

  // Obtener mensajes directos entre dos usuarios
  async getDirectMessages(userId1, userId2, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            name,
            email
          )
        `)
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .is('team_id', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching direct messages:', error);
        return [];
      }

      return data.reverse().map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender?.name || 'Unknown',
        senderEmail: msg.sender?.email || '',
        recipientId: msg.recipient_id,
        content: msg.content,
        messageType: msg.message_type,
        isRead: msg.is_read,
        createdAt: new Date(msg.created_at),
      }));
    } catch (error) {
      console.error('Get direct messages error:', error);
      return [];
    }
  },

  // Enviar mensaje a equipo
  async sendTeamMessage(teamId, senderId, content) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!senderId || !uuidRegex.test(senderId)) {
        return { success: false, error: 'Invalid user ID' };
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          team_id: teamId,
          sender_id: senderId,
          content: content.trim(),
          message_type: 'text',
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending team message:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: {
          id: data.id,
          senderId: data.sender_id,
          content: data.content,
          createdAt: new Date(data.created_at),
        },
      };
    } catch (error) {
      console.error('Send team message error:', error);
      return { success: false, error: error.message };
    }
  },

  // Enviar mensaje directo
  async sendDirectMessage(senderId, recipientId, content) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!senderId || !uuidRegex.test(senderId) || !recipientId || !uuidRegex.test(recipientId)) {
        return { success: false, error: 'Invalid user ID' };
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          content: content.trim(),
          message_type: 'text',
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending direct message:', error);
        return { success: false, error: error.message };
      }

      // Crear notificación para el destinatario
      await supabase.from('notifications').insert({
        user_id: recipientId,
        type: 'message',
        title: 'Nuevo mensaje',
        message: `Tienes un nuevo mensaje`,
        related_id: data.id,
      });

      return {
        success: true,
        message: {
          id: data.id,
          senderId: data.sender_id,
          recipientId: data.recipient_id,
          content: data.content,
          createdAt: new Date(data.created_at),
        },
      };
    } catch (error) {
      console.error('Send direct message error:', error);
      return { success: false, error: error.message };
    }
  },
};
