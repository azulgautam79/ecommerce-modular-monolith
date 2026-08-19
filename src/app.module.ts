import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './common/health/health.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import configuration from './common/config/configuration';

@Module({
  imports: [
    //! Configs
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      }
    }),

    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
