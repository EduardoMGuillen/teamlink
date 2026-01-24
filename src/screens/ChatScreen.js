import React, { useState, useEffect, useRef } from 'react';
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
import { useAppState } from '../context/AppStateContext';
import { messagesService } from '../services/messagesService';
import { teamsService } from '../services/teamsService';
import { useRoute } from '@react-navigation/native';

export default function ChatScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAppState();
  const route = useRoute();
  const { userId, teamId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    if (userId) {
      loadRecipientName();
    }
  }, [userId, teamId, currentUser]);

  const loadRecipientName = async () => {
    try {
      const users = await teamsService.getAllUsers();
      const recipient = users.find(u => u.id === userId);
      if (recipient) {
        setRecipientName(recipient.name);
      }
    } catch (error) {
      console.error('Error loading recipient name:', error);
    }
  };

  const loadMessages = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      let loadedMessages = [];
      if (teamId) {
        loadedMessages = await messagesService.getTeamMessages(teamId);
      } else if (userId) {
        loadedMessages = await messagesService.getDirectMessages(currentUser.id, userId);
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
        await loadMessages();
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {teamId ? t('team') : recipientName || t('chat')}
          </Text>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
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
    color: '#8E8E93',
    marginBottom: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
});
