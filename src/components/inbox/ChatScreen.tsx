import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { RootStackScreenProps } from '../../types/navigation';
import { COLORS, SPACING } from '../../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
}

type Props = RootStackScreenProps<'Chat'>;

const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! I loved your latest drone flight video!',
      timestamp: '12:30',
      isMine: false,
    },
    {
      id: '2',
      text: 'Thanks! I shot it with the new DJI Mini 3 Pro',
      timestamp: '12:31',
      isMine: true,
    },
    {
      id: '3',
      text: 'The sunset colors were amazing. Which location was that?',
      timestamp: '12:32',
      isMine: false,
    },
  ]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>Anna Peters</Text>
            <Text style={styles.userStatus}>Online</Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="video" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="phone" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          text: message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: true,
        },
      ]);
      setMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isMine && styles.myMessageContainer]}>
      <View style={[styles.messageBubble, item.isMine && styles.myMessageBubble]}>
        <Text style={[styles.messageText, item.isMine && styles.myMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, item.isMine && styles.myMessageTime]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.messagesContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted
        />
      </View>
      
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="plus" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Message..."
          value={message}
          onChangeText={setMessage}
          multiline
          placeholderTextColor={COLORS.textSecondary}
        />
        
        {message.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.mediaButtons}>
            <TouchableOpacity style={styles.mediaButton}>
              <Icon name="camera" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton}>
              <Icon name="microphone" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    minHeight: 60,
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  userStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: SPACING.md,
  },
  messageContainer: {
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxWidth: '80%',
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  myMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  attachButton: {
    marginRight: SPACING.sm,
  },
  sendButton: {
    marginLeft: SPACING.sm,
  },
  mediaButtons: {
    flexDirection: 'row',
    marginLeft: SPACING.sm,
  },
  mediaButton: {
    marginLeft: SPACING.sm,
  },
});

export default ChatScreen; 