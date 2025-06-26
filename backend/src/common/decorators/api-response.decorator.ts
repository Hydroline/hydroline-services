import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponseDto, ErrorResponseDto } from '../dto/response.dto';

export const ApiSuccessResponse = <T>(
  dataType?: Type<T>,
  description: string = '请求成功',
) => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseDto) },
          {
            properties: {
              data: dataType
                ? { $ref: getSchemaPath(dataType) }
                : { type: 'object' },
            },
          },
        ],
      },
    }),
  );
};

export const ApiErrorResponses = () => {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: '请求参数错误',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: '未授权访问',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: '禁止访问',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: '服务器内部错误',
      type: ErrorResponseDto,
    }),
  );
};

export const ApiStandardResponses = <T>(
  dataType?: Type<T>,
  successDescription: string = '请求成功',
) => {
  return applyDecorators(
    ApiSuccessResponse(dataType, successDescription),
    ApiErrorResponses(),
  );
};
