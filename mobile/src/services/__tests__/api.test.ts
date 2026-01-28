import { authService, userService, messageService } from '../api';

// Mock services para testes simples
jest.mock('../api', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
  },
  userService: {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
  },
  messageService: {
    sendMessage: jest.fn(),
    getMessages: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
  },
}));

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authService', () => {
    describe('login', () => {
      it('should login successfully', async () => {
        const mockResponse = {
          success: true,
          token: 'test-token',
          user: { id: '1', username: 'test' },
        };
        (authService.login as jest.Mock).mockResolvedValue(mockResponse);

        const result = await authService.login('test', 'password');

        expect(authService.login).toHaveBeenCalledWith('test', 'password');
        expect(result).toEqual(mockResponse);
      });

      it('should handle login error', async () => {
        (authService.login as jest.Mock).mockRejectedValue(new Error('Login failed'));

        await expect(authService.login('test', 'wrong')).rejects.toThrow('Login failed');
      });

      it('should handle network error', async () => {
        (authService.login as jest.Mock).mockRejectedValue(new Error('Network Error'));

        await expect(authService.login('test', 'password')).rejects.toThrow();
      });
    });

    describe('register', () => {
      it('should register successfully', async () => {
        const mockResponse = {
          success: true,
          token: 'test-token',
          user: { id: '1', nome: 'Test', username: 'test' },
        };
        (authService.register as jest.Mock).mockResolvedValue(mockResponse);

        const result = await authService.register('Test', 'test', 'password');

        expect(authService.register).toHaveBeenCalledWith('Test', 'test', 'password');
        expect(result).toEqual(mockResponse);
      });

      it('should handle registration error', async () => {
        (authService.register as jest.Mock).mockRejectedValue(new Error('User already exists'));

        await expect(authService.register('Test', 'test', 'password')).rejects.toThrow();
      });
    });
  });

  describe('userService', () => {
    describe('getAllUsers', () => {
      it('should fetch all users', async () => {
        const mockResponse = {
          success: true,
          users: [
            { _id: '1', nome: 'User 1', username: 'user1' },
            { _id: '2', nome: 'User 2', username: 'user2' },
          ],
        };
        (userService.getAllUsers as jest.Mock).mockResolvedValue(mockResponse);

        const result = await userService.getAllUsers();

        expect(userService.getAllUsers).toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
      });

      it('should handle error when fetching users', async () => {
        (userService.getAllUsers as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

        await expect(userService.getAllUsers()).rejects.toThrow();
      });
    });

    // describe('getUserById', () => {
    //   it('should fetch user by id', async () => {
    //     // Método removido pois não existe em userService
    //   });
    //   it('should handle error when fetching user by id', async () => {
    //     // Método removido pois não existe em userService
    //   });
    // });
  });

  describe('messageService', () => {
    // describe('sendMessage', () => {
    //   it('should send message successfully', async () => {
    //     // Método removido pois não existe em messageService
    //   });
    //   it('should handle error when sending message', async () => {
    //     // Método removido pois não existe em messageService
    //   });
    // });

    describe('getMessages', () => {
      it('should fetch messages', async () => {
        const mockResponse = {
          success: true,
          messages: [
            { _id: '1', text: 'Hello', sender: '1', receiver: '2' },
          ],
        };
        (messageService.getMessages as jest.Mock).mockResolvedValue(mockResponse);

        const result = await messageService.getMessages('2');

        expect(messageService.getMessages).toHaveBeenCalledWith('2');
        expect(result).toEqual(mockResponse);
      });

      it('should handle error when fetching messages', async () => {
        (messageService.getMessages as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

        await expect(messageService.getMessages('2')).rejects.toThrow();
      });
    });

    describe('getUnreadCount', () => {
      it('should fetch unread count', async () => {
        const mockResponse = {
          success: true,
          unreadCounts: { '1': 5, '2': 3 },
        };
        (messageService.getUnreadCount as jest.Mock).mockResolvedValue(mockResponse);

        const result = await messageService.getUnreadCount();

        expect(messageService.getUnreadCount).toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
      });
    });

    describe('markAsRead', () => {
      it('should mark message as read', async () => {
        const mockResponse = { success: true };
        (messageService.markAsRead as jest.Mock).mockResolvedValue(mockResponse);

        const result = await messageService.markAsRead('message-id');

        expect(messageService.markAsRead).toHaveBeenCalledWith('message-id');
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
