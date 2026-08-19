import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) { }

  getHello() {
    const baseUrl = this.configService.get<string>('API_URL');

    return {
      api: baseUrl,
      health: `${baseUrl}/api/health`,
      scalar: `${baseUrl}/api/docs`,
      openapi: `${baseUrl}/api/openapi.json`,
    };
  }
}
