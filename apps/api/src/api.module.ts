import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { JobsController } from './jobs/jobs.controller';
import { JobsService } from './jobs/jobs.service';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),],
  controllers: [ApiController, JobsController],
  providers: [ApiService, JobsService],
})
export class ApiModule {}
