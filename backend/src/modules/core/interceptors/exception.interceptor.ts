import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * 异常拦截器
 * 捕获所有未处理的异常，统一格式为 { code: xxx, message: yyy, error: zzz }
 */
@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ExceptionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorResponse: any = {
          code: 500,
          message: '服务器内部错误',
          error: error.name || 'InternalServerError',
        };

        // 处理 HttpException
        if (error instanceof HttpException) {
          status = error.getStatus();
          const response = error.getResponse();

          if (typeof response === 'object') {
            errorResponse = {
              code: status,
              message: response['message'] || error.message,
              error: response['error'] || error.name,
            };

            // 对于验证错误特殊处理
            if (Array.isArray(response['message'])) {
              errorResponse.message = response['message'][0];
              errorResponse.details = response['message'];
            }
          } else {
            errorResponse = {
              code: status,
              message: response || error.message,
              error: error.name,
            };
          }
        }

        // 记录错误日志
        this.logger.error(
          `[${errorResponse.code}] ${errorResponse.message}`,
          error.stack,
        );

        // 转换为标准错误响应
        return throwError(() => ({
          code: errorResponse.code,
          message: errorResponse.message,
          error: errorResponse.error,
          ...(errorResponse.details ? { details: errorResponse.details } : {}),
        }));
      }),
    );
  }
}
