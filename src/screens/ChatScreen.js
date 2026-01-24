import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { colors, radii, shadows } from '../utils/theme';
import { useAppState } from '../context/AppStateContext';
import { messagesService } from '../services/messagesService';
import { teamsService } from '../services/teamsService';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChatScreen() {
  const { t } = useTranslation();
  const { currentUser, selectedBackground } = useAppState();
  const hasCustomBackground = selectedBackground && selectedBackground !== 'default';
  const isWeb = Platform.OS === 'web';
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, teamId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [showConversation, setShowConversation] = useState(false);
  const flatListRef = useRef(null);

  // Actualizar título del header dinámicamente
  useLayoutEffect(() => {
    if (showConversation) {
      navigation.setOptions({
        title: teamId ? t('team') : recipientName || t('chat'),
        headerLeft: () => (
          <TouchableOpacity
            onPress={handleBackPress}
            style={{ marginLeft: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        title: t('messages'),
        headerLeft: undefined,
      });
    }
  }, [navigation, recipientName, teamId, t, showConversation]);

  useEffect(() => {
    checkUserTeams();
  }, [currentUser]);

  useEffect(() => {
    // Si hay parámetros en la ruta, mostrar la conversación directamente
    if (userId || teamId) {
      setShowConversation(true);
      loadMessagesForConversation(userId, teamId);
    }
  }, [userId, teamId, currentUser]);

  const checkUserTeams = async () => {
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const teams = await teamsService.getUserTeams(currentUser.id);
      
      if (teams.length === 0) {
        // Usuario no pertenece a ningún team, redirigir a Teams
        setIsLoading(false);
        setTimeout(() => {
          navigation.navigate('MainTabs', { screen: 'Teams' });
        }, 100);
        return;
      }

      // Usuario pertenece a un team, cargar conversaciones
      setUserTeams(teams);
      await loadConversations(teams[0].id); // Por ahora usar el primer team
    } catch (error) {
      console.error('Error checking user teams:', error);
      setIsLoading(false);
    }
  };

  const loadConversations = async (primaryTeamId) => {
    if (!currentUser?.id || !primaryTeamId) return;

    try {
      // Obtener miembros del team
      const members = await teamsService.getTeamMembers(primaryTeamId);
      const otherMembers = members.filter(m => m.userId !== currentUser.id);
      setTeamMembers(otherMembers);

      // Crear lista de conversaciones
      const convos = [];

      // Agregar chat grupal del team
      const teamInfo = userTeams.find(t => t.id === primaryTeamId);
      if (teamInfo) {
        // Obtener último mensaje del team
        const teamMessages = await messagesService.getTeamMessages(primaryTeamId);
        const lastMessage = teamMessages.length > 0 ? teamMessages[teamMessages.length - 1] : null;
        
        convos.push({
          id: `team-${primaryTeamId}`,
          type: 'team',
          name: teamInfo.name,
          teamId: primaryTeamId,
          lastMessage: lastMessage?.content || '',
          lastMessageTime: lastMessage?.createdAt || new Date(),
          unreadCount: 0, // TODO: implementar contador de no leídos
        });
      }

      // Agregar chats individuales con cada miembro
      for (const member of otherMembers) {
        const directMessages = await messagesService.getDirectMessages(currentUser.id, member.userId);
        const lastMessage = directMessages.length > 0 ? directMessages[directMessages.length - 1] : null;

        convos.push({
          id: `user-${member.userId}`,
          type: 'direct',
          name: member.user.name,
          userId: member.userId,
          avatar: null, // TODO: agregar avatares
          lastMessage: lastMessage?.content || '',
          lastMessageTime: lastMessage?.createdAt || new Date(),
          unreadCount: 0, // TODO: implementar contador de no leídos
        });
      }

      // Ordenar por último mensaje (más reciente primero)
      convos.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      setConversations(convos);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setIsLoading(false);
    }
  };


  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser?.id || isSending) return;

    setIsSending(true);
    try {
      let result;
      if (teamId) {
        result = await messagesService.sendTeamMessage(teamId, currentUser.id, messageText);
      } else if (userId) {
        result = await messagesService.sendDirectMessage(currentUser.id, userId, messageText);
      }

      if (result.success) {
        setMessageText('');
        // Recargar mensajes
        await loadMessagesForConversation(userId, teamId);
        // Actualizar lista de conversaciones
        if (userTeams.length > 0) {
          await loadConversations(userTeams[0].id);
        }
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now - messageDate;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return `${minutes} ${t('minutesAgo')}`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ${t('hoursAgo')}`;
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === currentUser?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
        <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
      </View>
    );
  };

  const handleConversationPress = (conversation) => {
    if (conversation.type === 'team') {
      setShowConversation(true);
      setRecipientName(conversation.name);
      // Cargar mensajes del team
      loadMessagesForConversation(null, conversation.teamId);
    } else {
      setShowConversation(true);
      setRecipientName(conversation.name);
      // Cargar mensajes directos
      loadMessagesForConversation(conversation.userId, null);
    }
  };

  const handleBackPress = () => {
    setShowConversation(false);
    setRecipientName('');
    setMessages([]);
    navigation.setParams({ userId: null, teamId: null });
  };

  const loadMessagesForConversation = async (targetUserId, targetTeamId) => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      let loadedMessages = [];
      if (targetTeamId) {
        loadedMessages = await messagesService.getTeamMessages(targetTeamId);
      } else if (targetUserId) {
        loadedMessages = await messagesService.getDirectMessages(currentUser.id, targetUserId);
        // Cargar nombre del destinatario
        const users = await teamsService.getAllUsers();
        const recipient = users.find(u => u.id === targetUserId);
        if (recipient) {
          setRecipientName(recipient.name);
        }
      }
      setMessages(loadedMessages);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastMessageTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now - messageDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return t('yesterday');
    if (days < 7) return `${days}d`;
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderConversation = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
      >
        <View style={styles.conversationAvatar}>
          {item.type === 'team' ? (
            <Ionicons name="people" size={28} color="#007AFF" />
          ) : (
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.lastMessageTime && (
              <Text style={styles.conversationTime}>
                {formatLastMessageTime(item.lastMessageTime)}
              </Text>
            )}
          </View>
          <View style={styles.conversationFooter}>
            <Text style={styles.conversationLastMessage} numberOfLines={1}>
              {item.lastMessage || t('noMessages')}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, hasCustomBackground && { backgroundColor: 'transparent' }]} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar lista de conversaciones
  if (!showConversation) {
    return (
      <SafeAreaView style={[styles.container, hasCustomBackground && styles.containerTransparent]} edges={['top', 'bottom']}>
        <View style={[styles.content, isWeb && styles.contentWeb, hasCustomBackground && styles.contentTransparent]}>
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.conversationsList, isWeb && styles.conversationsListWeb]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#C7C7CC" />
                <Text style={styles.emptyText}>{t('noMessages')}</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar conversación individual
  return (
    <SafeAreaView style={[styles.container, hasCustomBackground && styles.containerTransparent]} edges={['bottom']}>
      <View style={[styles.content, isWeb && styles.contentWeb, hasCustomBackground && styles.contentTransparent]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.messagesList, isWeb && styles.messagesListWeb]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#C7C7CC" />
                <Text style={styles.emptyText}>{t('noMessages')}</Text>
              </View>
            }
          />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('typeMessage')}
            placeholderTextColor="#8E8E93"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerTransparent: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  contentWeb: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  contentTransparent: {
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 12,
    borderRadius: radii.lg,
  },
  myMessageBubble: {
    backgroundColor: colors.primary,
  },
  otherMessageBubble: {
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    color: colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
  },
  conversationsList: {
    paddingVertical: 8,
  },
  conversationsListWeb: {
    paddingHorizontal: 0,
  },
  messagesListWeb: {
    paddingHorizontal: 0,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  conversationTime: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationLastMessage: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
