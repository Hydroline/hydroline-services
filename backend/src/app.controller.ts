import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SuccessMessage } from './modules/core/decorators';

@ApiTags('项目状态')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('server-info')
  @ApiOperation({ summary: '获取服务器信息' })
  @SuccessMessage('服务器信息获取成功')
  getServerInfo() {
    return this.appService.getServerInfo();
  }
}
