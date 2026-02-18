import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
