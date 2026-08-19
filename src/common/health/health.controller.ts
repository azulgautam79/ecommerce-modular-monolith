import { Controller, Get, Inject } from '@nestjs/common';
import { HealthService } from './health.service';
import { type Database, DATABASE } from '../../database/database.provider';
import { sql } from 'drizzle-orm';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,

    @Inject(DATABASE)
    private readonly db: Database,
  ) { }

  @Get()
  async check() {
    await this.db.execute(sql`SELECT 1`)

    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    }
  }
}
