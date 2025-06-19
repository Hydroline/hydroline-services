import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  TransformInterceptor,
  ExceptionInterceptor,
} from './modules/core/interceptors';
import { SwaggerModule } from '@nestjs/swagger';
import { setupSwagger } from './modules/core/swagger/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ExceptionInterceptor(),
  );

  const document = setupSwagger(app);

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
