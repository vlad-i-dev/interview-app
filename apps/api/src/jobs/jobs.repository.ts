import { Injectable } from '@nestjs/common';
import { Job } from './job.types';

@Injectable()
export class JobsRepository {
  private readonly jobs = new Map<string, Job>();
  private readonly byIdempotency = new Map<string, string>(); // key -> jobId

  findById(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  findByIdempotencyKey(key: string): Job | undefined {
    const id = this.byIdempotency.get(key);
    return id ? this.jobs.get(id) : undefined;
  }

  save(job: Job): void {
    this.jobs.set(job.id, job);
    if (job.idempotencyKey) this.byIdempotency.set(job.idempotencyKey, job.id);
  }
}