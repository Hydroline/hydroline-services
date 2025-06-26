import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SUCCESS_MESSAGE_KEY } from '../decorators/success-message.decorator';

export interface Response<T> {
  code: number;
  status: string;
  message: string | null;
  data: T;
  timestamp: number;
}

/**
 * 统一响应体拦截器
 * 将所有正常返回统一包装为 { code: 200, status: "success", message: null, data: any, timestamp: number }
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 从装饰器中获取自定义成功消息
        const successMessage = this.reflector.get<string>(
          SUCCESS_MESSAGE_KEY,
          context.getHandler(),
        );

        return {
          code: 200,
          status: 'success',
          message: successMessage || null,
          data,
          timestamp: Date.now(),
        };
      }),
    );
  }
}
