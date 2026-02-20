import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // CORS
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Security headers
  app.use(helmet());

  // Rate limiter
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // each IP can hit 100 requests per window
      standardHeaders: true, // return rate limit info in headers
      legacyHeaders: false,
      message: 'Too many requests, please try again later.',
    }),
  );

  // Cookie reader
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
