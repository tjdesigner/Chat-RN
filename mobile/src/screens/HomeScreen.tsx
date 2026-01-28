import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { userService, messageService } from '../services/api';
import socketService from '../services/socket';
import Button from '../components/Button';
import { COLORS, SIZES } from '../config/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Chat: { user: any };
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

interface User {
  _id: string;
  nome: string;
  username: string;
  isOnline: boolean;
  unreadCount?: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user: currentUser, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    setupSocketListeners();

    // Listener para quando voltar da tela de chat
    const unsubscribe = navigation.addListener('focus', () => {
      loadUnreadCounts();
    });

    return () => {
      socketService.off('user_online');
      socketService.off('user_offline');
      socketService.off('online_users');
      socketService.off('private_message');
      socketService.off('message_read');
      unsubscribe();
    };
  }, [navigation]);

  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      if (response.success) {
        // Filtrar o usuário atual da lista
        const filteredUsers = response.users.filter(
          (u: User) => u._id !== currentUser?._id
        );
        setUsers(filteredUsers);
        // Carregar contadores de mensagens não lidas
        await loadUnreadCounts();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const response = await messageService.getUnreadCount();
      console.log('Unread counts response:', response);
      if (response.success && response.unreadCounts) {
        console.log('Updating unread counts:', response.unreadCounts);
        // Atualizar contadores de mensagens não lidas para cada usuário
        setUsers(prevUsers =>
          prevUsers.map(user => {
            const count = response.unreadCounts[user._id] || 0;
            console.log(`User ${user.nome} (${user._id}): ${count} unread`);
            return {
              ...user,
              unreadCount: count,
            };
          })
        );
      }
    } catch (error) {
      console.error('Erro ao carregar contadores:', error);
    }
  };

  const setupSocketListeners = () => {
    // Atualizar lista de usuários online
    socketService.on('online_users', (onlineUsers: User[]) => {
      setUsers(prevUsers =>
        prevUsers.map(user => ({
          ...user,
          isOnline: onlineUsers.some(u => u._id === user._id),
        }))
      );
    });

    // Usuário ficou online
    socketService.on('user_online', ({ userId }: { userId: string }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isOnline: true } : user
        )
      );
    });

    // Usuário ficou offline
    socketService.on('user_offline', ({ userId }: { userId: string }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isOnline: false } : user
        )
      );
    });

    // Receber nova mensagem privada
    socketService.on('private_message', (message: any) => {
      console.log('Received private message:', message);
      // Incrementar contador de mensagens não lidas do remetente
      setUsers(prevUsers =>
        prevUsers.map(user => {
          if (user._id === message.sender._id) {
            const newCount = (user.unreadCount || 0) + 1;
            console.log(`Incrementing unread for ${user.nome}: ${newCount}`);
            return { ...user, unreadCount: newCount };
          }
          return user;
        })
      );
    });

    // Mensagem foi lida
    socketService.on('message_read', ({ receiverId }: { receiverId: string }) => {
      console.log('Message read by:', receiverId);
      // Decrementar contador de mensagens não lidas
      setUsers(prevUsers =>
        prevUsers.map(user => {
          if (user._id === receiverId && user.unreadCount && user.unreadCount > 0) {
            const newCount = user.unreadCount - 1;
            console.log(`Decrementing unread for ${user.nome}: ${newCount}`);
            return { ...user, unreadCount: newCount };
          }
          return user;
        })
      );
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleChatPress = (user: User) => {
    // Limpar contador de mensagens não lidas ao abrir o chat
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u._id === user._id ? { ...u, unreadCount: 0 } : u
      )
    );
    navigation.navigate('Chat', { user });
  };

  const renderUser = ({ item }: { item: User }) => {
    const hasUnread = item.unreadCount && item.unreadCount > 0;
    console.log(`Rendering ${item.nome}: unreadCount=${item.unreadCount}, hasUnread=${hasUnread}`);
    
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleChatPress(item)}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.nome.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: item.isOnline ? COLORS.online : COLORS.offline },
              ]}
            />
            {hasUnread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.unreadCount && item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.nome}</Text>
            <Text style={styles.userUsername}>@{item.username}</Text>
          </View>
        </View>
        <Text
          style={[
            styles.statusText,
            { color: item.isOnline ? COLORS.online : COLORS.offline },
          ]}
        >
          {item.isOnline ? 'Online' : 'Offline'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting} numberOfLines={1}>Olá, {currentUser?.nome}! 👋</Text>
          <Text style={styles.subtitle}>Selecione um usuário para conversar</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum usuário disponível</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTextContainer: {
    flexShrink: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.danger,
    borderRadius: SIZES.borderRadius,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  listContent: {
    padding: SIZES.padding,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: SIZES.margin / 2,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: SIZES.avatar,
    height: SIZES.avatar,
    borderRadius: SIZES.avatar / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  userUsername: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusText: {
    fontSize: SIZES.sm,
    fontWeight: '500',
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
  },
});

export default HomeScreen;
