import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
  JobsModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
