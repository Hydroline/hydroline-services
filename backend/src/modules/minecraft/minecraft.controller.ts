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
  ApiResponse,
  ApiOkResponse,
  ApiBadRequestResponse 
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

@ApiTags('Minecraft 工具')
@Controller('minecraft-utils')
export class MinecraftController {
  @Get('ping/java')
  @ApiOperation({ 
    summary: 'Ping Java版 Minecraft 服务器', 
    description: '获取 Java 版 Minecraft 服务器的状态信息，包括在线玩家数、MOTD、版本等' 
  })
  @ApiQuery({ 
    name: 'host', 
    description: '服务器主机名或IP地址', 
    example: 'mc.hypixel.net' 
  })
  @ApiQuery({ 
    name: 'port', 
    description: '服务器端口号（可选，默认25565）', 
    required: false, 
    example: '25565' 
  })
  @ApiOkResponse({ 
    description: '成功获取服务器信息',
    schema: {
      example: {
        code: 200,
        status: 'success',
        message: null,
        data: {
          version: { name: '1.20.1', protocol: 763 },
          players: { max: 100000, online: 65432, sample: [] },
          description: { text: 'Hypixel Network [1.8-1.20]' },
          favicon: 'data:image/png;base64,...',
          latency: 45
        },
        timestamp: 1703123456789
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: '请求参数错误或服务器连接失败',
    schema: {
      example: {
        code: 400,
        status: 'error',
        message: 'Failed to ping Java server mc.example.com: Connection timed out',
        data: null,
        timestamp: 1703123456789
      }
    }
  })
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
    description: '获取基岩版 Minecraft 服务器的状态信息，包括在线玩家数、MOTD、版本等' 
  })
  @ApiQuery({ 
    name: 'host', 
    description: '服务器主机名或IP地址', 
    example: 'mco.mineplex.com' 
  })
  @ApiQuery({ 
    name: 'port', 
    description: '服务器端口号（可选，默认19132）', 
    required: false, 
    example: '19132' 
  })
  @ApiOkResponse({ 
    description: '成功获取服务器信息',
    schema: {
      example: {
        code: 200,
        status: 'success',
        message: null,
        data: {
          edition: 'MCPE',
          motd: 'Dedicated Server',
          protocolVersion: 594,
          versionName: '1.20.1',
          playerCount: 0,
          maxPlayers: 20,
          serverId: '13253860892328930865',
          worldName: 'Bedrock level',
          gameMode: 'Survival',
          gameModeId: 0,
          portIPv4: 19132,
          portIPv6: 19133
        },
        timestamp: 1703123456789
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: '请求参数错误或服务器连接失败',
    schema: {
      example: {
        code: 400,
        status: 'error',
        message: 'Failed to ping Bedrock server mc.example.com: Connection timed out',
        data: null,
        timestamp: 1703123456789
      }
    }
  })
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
    description: '将 Minecraft 的 MOTD 格式（包含颜色代码）转换为 HTML 格式' 
  })
  @ApiBody({
    description: 'MOTD 数据（可以是字符串或对象）',
    schema: {
      type: 'object',
      properties: {
        motd: {
          oneOf: [
            { type: 'string', example: '§aHello §bWorld!' },
            { 
              type: 'object', 
              example: { 
                text: 'Hello ', 
                extra: [{ text: 'World!', color: 'blue' }] 
              } 
            }
          ]
        }
      },
      required: ['motd']
    }
  })
  @ApiOkResponse({ 
    description: '成功转换为 HTML',
    schema: {
      example: {
        code: 200,
        status: 'success',
        message: null,
        data: '<span style="color:#55FF55">Hello </span><span style="color:#55FFFF">World!</span>',
        timestamp: 1703123456789
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: '请求体中缺少 motd 参数',
    schema: {
      example: {
        code: 400,
        status: 'error',
        message: 'A "motd" property is required in the body.',
        data: null,
        timestamp: 1703123456789
      }
    }
  })
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
    description: '检查玩家名是否符合 Minecraft 的命名规则（3-16字符，只能包含字母、数字和下划线）' 
  })
  @ApiParam({ 
    name: 'name', 
    description: '要验证的玩家名', 
    example: 'Notch' 
  })
  @ApiOkResponse({ 
    description: '返回验证结果',
    schema: {
      example: {
        code: 200,
        status: 'success',
        message: null,
        data: {
          name: 'Notch',
          isValid: true
        },
        timestamp: 1703123456789
      }
    }
  })
  validatePlayerName(@Param('name') name: string) {
    return { name, isValid: isValidPlayerName(name) };
  }

  @Get('validate/uuid/:uuid')
  @ApiOperation({ 
    summary: '验证 UUID 格式', 
    description: '检查 UUID 是否符合标准格式（带或不带连字符）' 
  })
  @ApiParam({ 
    name: 'uuid', 
    description: '要验证的 UUID', 
    example: '069a79f4-44e9-4726-a5be-fca90e38aaf5' 
  })
  @ApiOkResponse({ 
    description: '返回验证结果',
    schema: {
      example: {
        code: 200,
        status: 'success',
        message: null,
        data: {
          uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
          isValid: true
        },
        timestamp: 1703123456789
      }
    }
  })
  validateUuid(@Param('uuid') uuid: string) {
    return { uuid, isValid: isValidUuid(uuid) };
  }

  @Get('format/uuid-add-dashes/:uuid')
  @ApiOperation({ 
    summary: '为 UUID 添加连字符', 
    description: '将无连字符的 UUID 格式化为标准的带连字符格式' 
  })
  @ApiParam({ 
    name: 'uuid', 
    description: '无连字符的 UUID', 
    example: '069a79f444e94726a5befca90e38aaf5' 
  })
  @ApiOkResponse({ 
    description: '返回格式化后的 UUID',
    schema: {
      example: {
        code: 200,
        status: 'success',
        message: null,
        data: {
          original: '069a79f444e94726a5befca90e38aaf5',
          dashed: '069a79f4-44e9-4726-a5be-fca90e38aaf5'
        },
        timestamp: 1703123456789
      }
    }
  })
  dashUuid(@Param('uuid') uuid: string) {
    return { original: uuid, dashed: addUuidDashes(uuid) };
  }

  @Get('format/uuid-remove-dashes/:uuid')
  @ApiOperation({ 
    summary: '移除 UUID 连字符', 
    description: '将带连字符的 UUID 转换为无连字符格式' 
  })
  @ApiParam({ 
    name: 'uuid', 
    description: '带连字符的 UUID', 
    example: '069a79f4-44e9-4726-a5be-fca90e38aaf5' 
  })
  @ApiOkResponse({ 
    description: '返回格式化后的 UUID',
    schema: {
      example: {
        code: 200,
        status: 'success',
        message: null,
        data: {
          original: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
          undashed: '069a79f444e94726a5befca90e38aaf5'
        },
        timestamp: 1703123456789
      }
    }
  })
  undashUuid(@Param('uuid') uuid: string) {
    return { original: uuid, undashed: removeUuidDashes(uuid) };
  }
}
