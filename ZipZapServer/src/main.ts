import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Set a global prefix for all routes
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  // Enable CORS with default settings
  app.enableCors();
  await app.listen(process.env.PORT ?? 8080);
}

bootstrap();
