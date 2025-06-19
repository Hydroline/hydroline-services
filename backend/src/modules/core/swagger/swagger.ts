import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import defaultConfig from '../../../config/default';

/**
 * 配置Swagger文档
 * @param app NestJS应用实例
 * @returns Swagger文档实例
 */
export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle(defaultConfig.swagger.title)
    .setDescription(defaultConfig.swagger.description)
    .setVersion(defaultConfig.swagger.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .addTag('认证', '用户认证与授权相关接口')
    .addTag('账户', '用户账户管理相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(defaultConfig.swagger.path, app, document);

  return document;
}
