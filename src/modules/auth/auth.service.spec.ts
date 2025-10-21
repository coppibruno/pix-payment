import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      mockConfigService.get
        .mockReturnValueOnce('admin')
        .mockReturnValueOnce('admin123');

      const result = await service.validateUser('admin', 'admin123');

      expect(result).toEqual({ username: 'admin', id: 1 });
      expect(configService.get).toHaveBeenCalledWith('AUTH_USERNAME', 'admin');
      expect(configService.get).toHaveBeenCalledWith(
        'AUTH_PASSWORD',
        'admin123',
      );
    });

    it('should return null for invalid credentials', async () => {
      mockConfigService.get
        .mockReturnValueOnce('admin')
        .mockReturnValueOnce('admin123');

      const result = await service.validateUser('wrong', 'wrong');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const mockUser = { username: 'admin', id: 1 };
      const mockToken = 'mock-jwt-token';

      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          username: 'admin',
          id: 1,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'admin',
        sub: 1,
      });
    });
  });

  describe('validateToken', () => {
    it('should return payload for valid token', async () => {
      const mockPayload = { username: 'admin', sub: 1 };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        'Token inválido',
      );
    });
  });
});
