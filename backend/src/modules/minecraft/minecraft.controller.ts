import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  pingJava,
  pingBedrock,
  motdToHtml,
  isValidPlayerName,
  isValidUuid,
  addUuidDashes,
  removeUuidDashes,
  JavaPingResponse,
  BedrockPingResponse,
} from '../../common/utils/minecraft';
import { ApiStandardResponses, SuccessResponseDto, ErrorResponseDto } from '../../common';
import {
  JavaPingResponseDto,
  BedrockPingResponseDto,
  MotdRequestDto,
  MotdHtmlResponseDto,
  PlayerNameValidationDto,
  UuidValidationDto,
  UuidDashResponseDto,
  UuidUndashResponseDto,
} from './dto';

@ApiTags('Minecraft 工具')
@ApiExtraModels(
  SuccessResponseDto,
  ErrorResponseDto,
  JavaPingResponseDto,
  BedrockPingResponseDto,
  MotdHtmlResponseDto,
  PlayerNameValidationDto,
  UuidValidationDto,
  UuidDashResponseDto,
  UuidUndashResponseDto,
)
@Controller('minecraft-utils')
export class MinecraftController {
  @Get('ping/java')
  @ApiOperation({
    summary: 'Ping Java版 Minecraft 服务器',
    description:
      '获取 Java 版 Minecraft 服务器的状态信息，包括在线玩家数、MOTD、版本等',
  })
  @ApiQuery({
    name: 'host',
    description: '服务器主机名或IP地址',
    example: 'mc.hypixel.net',
  })
  @ApiQuery({
    name: 'port',
    description: '服务器端口号（可选，默认25565）',
    required: false,
    example: '25565',
  })
  @ApiStandardResponses(JavaPingResponseDto, 'Java 服务器状态获取成功')
  async pingJavaServer(
    @Query('host') host: string,
    @Query('port') port?: string,
  ): Promise<JavaPingResponse> {
    if (!host) {
      throw new BadRequestException('Host query parameter is required.');
    }
    try {
      return await pingJava(host, {
        port: port ? parseInt(port, 10) : undefined,
      });
    } catch (e) {
      throw new BadRequestException(
        `Failed to ping Java server ${host}: ${(e as Error).message}`,
      );
    }
  }

  @Get('ping/bedrock')
  @ApiOperation({
    summary: 'Ping 基岩版 Minecraft 服务器',
    description:
      '获取基岩版 Minecraft 服务器的状态信息，包括在线玩家数、MOTD、版本等',
  })
  @ApiQuery({
    name: 'host',
    description: '服务器主机名或IP地址',
    example: 'mco.mineplex.com',
  })
  @ApiQuery({
    name: 'port',
    description: '服务器端口号（可选，默认19132）',
    required: false,
    example: '19132',
  })
  @ApiStandardResponses(BedrockPingResponseDto, '基岩版服务器状态获取成功')
  async pingBedrockServer(
    @Query('host') host: string,
    @Query('port') port?: string,
  ): Promise<BedrockPingResponse> {
    if (!host) {
      throw new BadRequestException('Host query parameter is required.');
    }
    try {
      return await pingBedrock(host, {
        port: port ? parseInt(port, 10) : undefined,
      });
    } catch (e) {
      throw new BadRequestException(
        `Failed to ping Bedrock server ${host}: ${(e as Error).message}`,
      );
    }
  }

  @Post('motd-to-html')
  @ApiOperation({
    summary: '将 MOTD 转换为 HTML',
    description: '将 Minecraft 的 MOTD 格式（包含颜色代码）转换为 HTML 格式',
  })
  @ApiBody({
    description: 'MOTD 数据（可以是字符串或对象）',
    type: MotdRequestDto,
  })
  @ApiStandardResponses(MotdHtmlResponseDto, 'MOTD 转换成功')
  getMotdAsHtml(@Body('motd') motd: any) {
    if (!motd) {
      throw new BadRequestException(
        'A "motd" property is required in the body.',
      );
    }
    return motdToHtml(motd);
  }

  @Get('validate/player-name/:name')
  @ApiOperation({
    summary: '验证 Minecraft 玩家名',
    description:
      '检查玩家名是否符合 Minecraft 的命名规则（3-16字符，只能包含字母、数字和下划线）',
  })
  @ApiParam({
    name: 'name',
    description: '要验证的玩家名',
    example: 'Notch',
  })
  @ApiStandardResponses(PlayerNameValidationDto, '玩家名验证完成')
  validatePlayerName(@Param('name') name: string) {
    return { name, isValid: isValidPlayerName(name) };
  }

  @Get('validate/uuid/:uuid')
  @ApiOperation({
    summary: '验证 UUID 格式',
    description: '检查 UUID 是否符合标准格式（带或不带连字符）',
  })
  @ApiParam({
    name: 'uuid',
    description: '要验证的 UUID',
    example: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
  })
  @ApiStandardResponses(UuidValidationDto, 'UUID 验证完成')
  validateUuid(@Param('uuid') uuid: string) {
    return { uuid, isValid: isValidUuid(uuid) };
  }

  @Get('format/uuid-add-dashes/:uuid')
  @ApiOperation({
    summary: '为 UUID 添加连字符',
    description: '将无连字符的 UUID 格式化为标准的带连字符格式',
  })
  @ApiParam({
    name: 'uuid',
    description: '无连字符的 UUID',
    example: '069a79f444e94726a5befca90e38aaf5',
  })
  @ApiStandardResponses(UuidDashResponseDto, 'UUID 格式化完成')
  dashUuid(@Param('uuid') uuid: string) {
    return { original: uuid, dashed: addUuidDashes(uuid) };
  }

  @Get('format/uuid-remove-dashes/:uuid')
  @ApiOperation({
    summary: '移除 UUID 连字符',
    description: '将带连字符的 UUID 转换为无连字符格式',
  })
  @ApiParam({
    name: 'uuid',
    description: '带连字符的 UUID',
    example: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
  })
  @ApiStandardResponses(UuidUndashResponseDto, 'UUID 格式化完成')
  undashUuid(@Param('uuid') uuid: string) {
    return { original: uuid, undashed: removeUuidDashes(uuid) };
  }
}
