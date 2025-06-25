import { Injectable } from '@nestjs/common';
import config from './config';

@Injectable()
export class AppService {
  getAppStatus() {
    return {
      name: config.app.name,
      version: config.app.version,
      description: config.app.description,
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
} 