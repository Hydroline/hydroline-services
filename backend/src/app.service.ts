import { Injectable } from '@nestjs/common';
import config from './config';

@Injectable()
export class AppService {
  getServerInfo() {
    return {
      appName: config.app.name,
      appVersion: config.app.version,
      description: config.app.description,
      timezone: config.server.timezone,
      location: config.server.location,
      api: {
        version: config.api.version,
        title: config.api.documentation.title,
      },
    };
  }
}
