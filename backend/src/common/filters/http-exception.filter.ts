import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let data = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse['message']) {
        // 处理验证错误（数组形式的message）
        if (Array.isArray(errorResponse['message'])) {
          message = errorResponse['message'][0]; // 取第一个错误信息
        } else {
          message = errorResponse['message'];
        }

        // 如果异常响应中有data字段，则保留
        if (errorResponse['data']) {
          data = errorResponse['data'];
        }
      } else if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 只记录500及以上的服务器错误或非HTTP异常
    if (!(exception instanceof HttpException) || status >= 500) {
      this.logger.error(
        `[${status}] ${message} - ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    // 返回统一格式的错误响应
    const now = new Date();
    response.status(status).json({
      code: status,
      status: 'error',
      message: message,
      data: data,
      timestamp: now.getTime(),
      isoTime: now.toISOString(),
    });
  }
}
