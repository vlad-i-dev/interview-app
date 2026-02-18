import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@Controller()
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  // create job and return uploadUrl
  @Post('/jobs')
  create(@Body() body: CreateJobDto) {
    return this.jobs.create(body);
  }

  // mark file as loaded
  @Post('/jobs/:id/uploaded')
  uploaded(@Param('id') id: string) {
    return this.jobs.markUploaded(id);
  }

  // send to queue (mock)
  @Post('/jobs/:id/submit')
  submit(@Param('id') id: string) {
    return this.jobs.submit(id);
  }

  // get status
  @Get('/jobs/:id')
  get(@Param('id') id: string) {
    return this.jobs.get(id);
  }

  // mock lambda worker
  @Post('/jobs/:id/simulate')
  simulate(@Param('id') id: string) {
    return this.jobs.simulateProcess(id);
  }
}
