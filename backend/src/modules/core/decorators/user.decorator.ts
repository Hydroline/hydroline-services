import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前登录用户的装饰器
 * 使用方法: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
