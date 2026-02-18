import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';
import { DevController } from './dev.controller';

@Module({
  controllers: [JobsController, DevController],
  providers: [JobsRepository, JobsService],
})
export class JobsModule {}
