import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Behind the Cloudflare Tunnel the real client IP arrives via X-Forwarded-For.
  // Trusting one proxy hop lets express (and the rate limiter) see the actual IP.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet());

  // Restrict CORS to the configured frontend origin(s). Comma-separated list in
  // CORS_ORIGIN; when unset (local dev) any origin is reflected.
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : true,
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Pallets Product Control API')
    .setDescription('API para controle de produção de pallets')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
