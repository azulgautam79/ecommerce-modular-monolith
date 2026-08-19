
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema';
import { ConfigService } from '@nestjs/config';

export const DATABASE = Symbol('DATABASE');

export const databaseProvider = {
    provide: DATABASE,
    inject: [ConfigService],

    useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.getOrThrow<string>(
            'database.url',
        );

        const sql = neon(databaseUrl);

        return drizzle(sql, {
            schema,
        });
    },
};

export type Database = ReturnType<typeof databaseProvider.useFactory>;