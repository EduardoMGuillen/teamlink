import { supabase } from '../config/supabase';

export const notificationsService = {
  // Obtener notificaciones del usuario
  async getUserNotifications(userId, limit = 50) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!userId || !uuidRegex.test(userId)) {
        return [];
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        relatedId: notif.related_id,
        isRead: notif.is_read,
        createdAt: new Date(notif.created_at),
      }));
    } catch (error) {
      console.error('Get user notifications error:', error);
      return [];
    }
  },

  // Obtener notificaciones no leídas
  async getUnreadNotifications(userId) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!userId || !uuidRegex.test(userId)) {
        return [];
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching unread notifications:', error);
        return [];
      }

      return data.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        relatedId: notif.related_id,
        isRead: notif.is_read,
        createdAt: new Date(notif.created_at),
      }));
    } catch (error) {
      console.error('Get unread notifications error:', error);
      return [];
    }
  },

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: error.message };
    }
  },

  // Marcar todas como leídas
  async markAllAsRead(userId) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!userId || !uuidRegex.test(userId)) {
        return { success: false, error: 'Invalid user ID' };
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { success: false, error: error.message };
    }
  },
};
