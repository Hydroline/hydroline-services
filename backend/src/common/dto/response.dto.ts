import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = any> {
  @ApiProperty({ example: 200, description: '状态码' })
  code: number;

  @ApiProperty({ example: 'success', description: '状态' })
  status: string;

  @ApiProperty({ example: '操作成功', description: '消息', nullable: true })
  message: string | null;

  @ApiProperty({ description: '响应数据' })
  data: T;

  @ApiProperty({ example: 1640995200000, description: '时间戳' })
  timestamp: number;

  @ApiProperty({ example: '2021-12-31T16:00:00.000Z', description: 'ISO 时间格式' })
  isoTime: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400, description: '错误状态码' })
  code: number;

  @ApiProperty({ example: 'error', description: '状态' })
  status: string;

  @ApiProperty({ example: '请求参数错误', description: '错误消息' })
  message: string;

  @ApiProperty({ example: null, description: '错误数据', nullable: true })
  data: any;

  @ApiProperty({ example: 1640995200000, description: '时间戳' })
  timestamp: number;

  @ApiProperty({ example: '2021-12-31T16:00:00.000Z', description: 'ISO 时间格式' })
  isoTime: string;
}

export class SuccessResponseDto<T = any> extends BaseResponseDto<T> {
  @ApiProperty({ example: 200 })
  declare code: 200;

  @ApiProperty({ example: 'success' })
  declare status: 'success';
}
