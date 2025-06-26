import { SetMetadata } from '@nestjs/common';

export const SUCCESS_MESSAGE_KEY = 'successMessage';

/**
 * 成功消息装饰器
 * 用于为API接口设置成功时的自定义消息
 *
 * @param message 成功消息内容
 * @example
 * @SuccessMessage('用户创建成功')
 * @Post('users')
 * createUser() {
 *   // ...
 * }
 */
export const SuccessMessage = (message: string) =>
  SetMetadata(SUCCESS_MESSAGE_KEY, message);
