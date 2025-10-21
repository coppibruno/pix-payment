import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Charge } from '../../src/database/entities/charge.entity';
import {
  NotificationLog,
  NotificationLogSchema,
} from '../../src/database/schemas/notification-log.schema';

describe('Pix Payment API E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let createdChargeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: 'test.env',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT) || 5432,
          username: process.env.DATABASE_USERNAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
          database: process.env.DATABASE_NAME || 'pix_payment_test',
          entities: [Charge],
          synchronize: true,
          dropSchema: true, // Limpa o banco a cada teste
        }),
        MongooseModule.forRoot(
          process.env.MONGODB_URI ||
            'mongodb://localhost:27017/pix_payment_logs_test',
        ),
        MongooseModule.forFeature([
          { name: NotificationLog.name, schema: NotificationLogSchema },
        ]),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-secret',
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
        }),
        PassportModule,
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configuração de validação global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Configuração do CORS
    app.enableCors();

    // Configuração do Swagger
    const config = new DocumentBuilder()
      .setTitle('Gateway Pix API')
      .setDescription('API simplificada para gateway de pagamentos Pix')
      .setVersion('1.0')
      .addTag('auth', 'Autenticação e autorização')
      .addTag('charges', 'Operações relacionadas a cobranças Pix')
      .addTag('notifications', 'Operações relacionadas a notificações')
      .addTag('health', 'Verificação de saúde dos serviços')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        username: process.env.AUTH_USERNAME || 'admin',
        password: process.env.AUTH_PASSWORD || 'admin123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username');
      expect(response.body.user).toHaveProperty('id');

      authToken = response.body.access_token;
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        username: 'invalid',
        password: 'invalid',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);
    });

    it('should reject login with invalid password length', async () => {
      const loginData = {
        username: 'admin',
        password: '123', // Muito curta
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);
    });
  });

  describe('Authorization', () => {
    it('should reject requests without token', async () => {
      await request(app.getHttpServer())
        .get('/charges/560a85f3-a883-46f5-a8e1-9d4ae9793ebe')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/charges/560a85f3-a883-46f5-a8e1-9d4ae9793ebe')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should allow access to public routes without token', async () => {
      await request(app.getHttpServer()).get('/health').expect(200);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: process.env.AUTH_USERNAME || 'admin',
          password: process.env.AUTH_PASSWORD || 'admin123',
        })
        .expect(200);
    });
  });

  describe('Charges Management', () => {
    it('should create a new charge', async () => {
      const chargeData = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 100.5,
        description: 'Pagamento de teste',
      };

      const response = await request(app.getHttpServer())
        .post('/charges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(chargeData)
        .expect(201);

      expect(response.body).toHaveProperty('charge_id');
      expect(response.body).toHaveProperty('payer_name', chargeData.payer_name);
      expect(response.body).toHaveProperty(
        'payer_document',
        chargeData.payer_document,
      );
      expect(response.body).toHaveProperty('amount', chargeData.amount);
      expect(response.body).toHaveProperty(
        'description',
        chargeData.description,
      );
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('created_at');

      createdChargeId = response.body.charge_id;
    });

    it('should get a specific charge by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/charges/${createdChargeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('charge_id', createdChargeId);
      expect(response.body).toHaveProperty('payer_name');
      expect(response.body).toHaveProperty('amount');
    });

    it('should simulate payment for a charge', async () => {
      const paymentData = {
        charge_id: createdChargeId,
      };

      const response = await request(app.getHttpServer())
        .post('/charges/simulate-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject charge creation with invalid data', async () => {
      const invalidData = {
        payer_name: '', // Nome vazio
        payer_document: '123', // Documento inválido
        amount: -10, // Valor negativo
      };

      await request(app.getHttpServer())
        .post('/charges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should reject charge creation without required fields', async () => {
      const incompleteData = {
        payer_name: 'João Silva',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/charges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('Notifications', () => {
    it('should get notification logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
    });

    it('should get notification stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total_logs');
      expect(response.body).toHaveProperty('today_logs');
      expect(response.body).toHaveProperty('status_counts');
      expect(typeof response.body.total_logs).toBe('number');
    });

    it('should handle pagination in notifications', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      await request(app.getHttpServer())
        .post('/charges')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        payer_name: 'João Silva',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/charges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);
    });

    it('should handle non-existent charge ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/charges/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation', async () => {
      await request(app.getHttpServer()).get('/api').expect(200);
    });

    it('should serve Swagger JSON', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('title', 'Gateway Pix API');
    });
  });
});
