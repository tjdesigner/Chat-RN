import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/api';
import socketService from '../services/socket';
import { COLORS, SIZES } from '../config/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Chat: { user: any };
};

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
  route: RouteProp<RootStackParamList, 'Chat'>;
};

interface Message {
  _id: string;
  sender: {
    _id: string;
    nome: string;
    username: string;
  };
  receiver: {
    _id: string;
    nome: string;
    username: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { user: currentUser } = useAuth();
  const { user: otherUser } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    navigation.setOptions({
      title: otherUser.nome,
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
    });

    loadMessages();
    setupSocketListeners();

    return () => {
      socketService.off('new_message');
      socketService.off('message_sent');
      socketService.off('user_typing');
      socketService.off('user_stop_typing');
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await messageService.getMessages(otherUser._id);
      if (response.success) {
        setMessages(response.messages);
        // Marcar mensagens não lidas como lidas
        markUnreadMessagesAsRead(response.messages);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const markUnreadMessagesAsRead = async (msgs: Message[]) => {
    // Encontrar mensagens não lidas que foram enviadas para mim
    const unreadMessages = msgs.filter(
      msg => !msg.read && msg.receiver._id === currentUser?._id
    );

    // Marcar cada mensagem como lida
    for (const message of unreadMessages) {
      try {
        await messageService.markAsRead(message._id);
      } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error);
      }
    }
  };

  const setupSocketListeners = () => {
    // Nova mensagem recebida
    socketService.on('new_message', (message: Message) => {
      if (message.sender._id === otherUser._id) {
        setMessages(prev => [...prev, message]);
        // Marcar a nova mensagem como lida imediatamente
        if (message.receiver._id === currentUser?._id) {
          messageService.markAsRead(message._id).catch(err => 
            console.error('Erro ao marcar mensagem como lida:', err)
          );
        }
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    // Mensagem enviada confirmada
    socketService.on('message_sent', (message: Message) => {
      setMessages(prev => [...prev, message]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Usuário está digitando
    socketService.on('user_typing', ({ userId }: { userId: string }) => {
      if (userId === otherUser._id) {
        setIsTyping(true);
      }
    });

    // Usuário parou de digitar
    socketService.on('user_stop_typing', ({ userId }: { userId: string }) => {
      if (userId === otherUser._id) {
        setIsTyping(false);
      }
    });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    socketService.sendMessage(otherUser._id, inputText.trim());
    setInputText('');
    socketService.stopTyping(otherUser._id);
  };

  const handleTyping = (text: string) => {
    setInputText(text);

    // Enviar evento de digitação
    if (text.length > 0) {
      socketService.typing(otherUser._id);

      // Parar de digitar após 2 segundos de inatividade
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(otherUser._id);
      }, 2000);
    } else {
      socketService.stopTyping(otherUser._id);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender._id === currentUser?._id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
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
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhuma mensagem ainda.{'\n'}Envie a primeira! 👋
            </Text>
          </View>
        }
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{otherUser.nome} está digitando...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={COLORS.textPlaceholder}
          value={inputText}
          onChangeText={handleTyping}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    padding: SIZES.padding,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: COLORS.myMessage,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.otherMessage,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: SIZES.md,
    marginBottom: 4,
  },
  myMessageText: {
    color: COLORS.myMessageText,
  },
  otherMessageText: {
    color: COLORS.otherMessageText,
  },
  messageTime: {
    fontSize: SIZES.xs,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: COLORS.textSecondary,
  },
  typingContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    marginRight: 8,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    fontSize: 20,
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default ChatScreen;
