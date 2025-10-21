import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  describe('/charges (POST)', () => {
    it('should create a charge', () => {
      const createChargeDto = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
      };

      return request(app.getHttpServer())
        .post('/charges')
        .send(createChargeDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('charge_id');
          expect(res.body).toHaveProperty('pix_key');
          expect(res.body).toHaveProperty('status', 'pending');
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidDto = {
        payer_name: '',
        payer_document: '123',
        amount: -100,
      };

      return request(app.getHttpServer())
        .post('/charges')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/charges/:id (GET)', () => {
    it('should return 404 for non-existent charge', () => {
      return request(app.getHttpServer())
        .get('/charges/non-existent-id')
        .expect(404);
    });
  });

  describe('/charges/simulate-payment (POST)', () => {
    it('should simulate payment notification', () => {
      const simulatePaymentDto = {
        charge_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      return request(app.getHttpServer())
        .post('/charges/simulate-payment')
        .send(simulatePaymentDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});
