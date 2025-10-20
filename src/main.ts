import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .addTag('charges', 'Operações relacionadas a cobranças Pix')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Aplicação rodando na porta ${port}`);
  console.log(`📚 Documentação disponível em http://localhost:${port}/api`);
}
bootstrap();
