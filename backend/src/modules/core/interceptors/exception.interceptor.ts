import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

/**
 * 异常拦截器
 * 主要用于记录异常日志，实际的异常响应格式由全局异常过滤器处理
 */
@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ExceptionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    return next.handle().pipe(
      tap(() => {
        // 可以在这里记录成功请求的日志
        // this.logger.log(`${request.method} ${request.url} - Success`);
      }),
      catchError((error) => {
        // 只记录500及以上的服务器错误或非HTTP异常
        if (!(error instanceof HttpException) || error.getStatus() >= 500) {
          this.logger.error(
            `${request.method} ${request.url} - ${error.message}`,
            error.stack,
          );
        }

        // 重新抛出异常，让全局异常过滤器处理
        throw error;
      }),
    );
  }
}
