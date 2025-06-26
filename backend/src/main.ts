import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor, HttpExceptionFilter } from './common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import config from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用CORS
  app.enableCors(config.security.cors);

  // 设置全局前缀
  app.setGlobalPrefix(config.api.prefix);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 获取 Reflector 实例用于拦截器
  const reflector = app.get(Reflector);

  // 全局响应转换拦截器
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // 配置Swagger文档
  if (config.api.documentation.enabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(config.api.documentation.title)
      .setDescription(config.api.documentation.description)
      .setVersion(config.api.documentation.version)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'JWT',
      )
      .addServer(`http://localhost:${config.app.port}`, '本地开发环境');

    // 添加API标签
    config.api.documentation.tags.forEach((tag) => {
      swaggerConfig.addTag(tag.name, tag.description);
    });

    const document = SwaggerModule.createDocument(app, swaggerConfig.build());
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(config.app.port);
}

bootstrap();
