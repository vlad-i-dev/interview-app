import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { JobsController } from './jobs/jobs.controller';
import { JobsService } from './jobs/jobs.service';

@Module({
  imports: [],
  controllers: [ApiController, JobsController],
  providers: [ApiService, JobsService],
})
export class ApiModule {}
