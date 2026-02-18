import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JobsRepository } from './jobs.repository';
import { Job } from './job.types';
import { CreateJobDto } from './dto/create-job.dto';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from '../config/app.config';
import { createHash } from 'crypto';
import { resultPath, uploadPath, writeFile, readFileIfExists } from './storage.local';

const nowIso = () => new Date().toISOString();

@Injectable()
export class JobsService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    
    private readonly repo: JobsRepository) {}

  create(dto: CreateJobDto) {
    if (dto.idempotencyKey) {
      const existing = this.repo.findByIdempotencyKey(dto.idempotencyKey);
      if (existing) return this.toCreateResponse(existing);
    }

    const id = randomUUID();
    const ts = nowIso();

    const uploadKey = `uploads/${id}/original.bin`;

    const job: Job = {
      id,
      status: 'UPLOAD_URL_ISSUED',
      originalKey: uploadKey,
      idempotencyKey: dto.idempotencyKey,
      createdAt: ts,
      updatedAt: ts,
    };

    this.repo.save(job);
    return this.toCreateResponse(job);
  }

  markUploaded(jobId: string) {
    const job = this.mustGet(jobId);
    if (job.status !== 'UPLOAD_URL_ISSUED') {
      throw new BadRequestException(`Cannot mark uploaded from status=${job.status}`);
    }
    job.status = 'UPLOADED';
    job.updatedAt = nowIso();
    this.repo.save(job);
    return this.toGetResponse(job);
  }

  submit(jobId: string) {
    const job = this.mustGet(jobId);

    if (job.status !== 'UPLOAD_URL_ISSUED' && job.status !== 'UPLOADED') {
      throw new BadRequestException(`Job cannot be submitted from status=${job.status}`);
    }

    job.status = 'QUEUED';
    job.updatedAt = nowIso();
    this.repo.save(job);

    // TODO: sending message to SQS
    return { jobId: job.id, status: job.status };
  }

  get(jobId: string) {
    const job = this.mustGet(jobId);
    return this.toGetResponse(job);
  }

  async simulateProcess(jobId: string) {
    const job = this.mustGet(jobId);

    if (job.status !== 'QUEUED') {
      throw new BadRequestException(`Job cannot be processed from status=${job.status}`);
    }

    job.status = 'PROCESSING';
    job.updatedAt = nowIso();
    this.repo.save(job);

    const uploaded = await readFileIfExists(uploadPath(jobId));
if (!uploaded) {
  throw new BadRequestException('No uploaded file found (dev)');
}

const sha256 = createHash('sha256').update(uploaded).digest('hex');

job.resultKey = `results/${job.id}/result.json`;

const result = {
  jobId: job.id,
  status: 'DONE',
  sha256,
  size: uploaded.length,
  processedAt: new Date().toISOString(),
};

await writeFile(resultPath(jobId), Buffer.from(JSON.stringify(result, null, 2), 'utf-8'));

    job.resultKey = `results/${job.id}/result.json`;

    job.status = 'DONE';
    job.updatedAt = nowIso();
    this.repo.save(job);

    return this.toGetResponse(job);
  }

  async handleDevUpload(jobId: string, body: Buffer) {
  const job = this.mustGet(jobId);

  if (job.status !== 'UPLOAD_URL_ISSUED') {
    throw new BadRequestException(`Cannot upload from status=${job.status}`);
  }

  // s3 emulation
  await writeFile(uploadPath(jobId), body);

  job.status = 'UPLOADED';
  job.updatedAt = nowIso();
  this.repo.save(job);

  return this.toGetResponse(job);
}

  private mustGet(jobId: string): Job {
    const job = this.repo.findById(jobId);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  private toCreateResponse(job: Job) {
    return {
      jobId: job.id,
      uploadUrl: `${this.config.publicBaseUrl}/${this.config.uploadPath}/${job.id}`,
      uploadKey: job.originalKey!,
    };
  }

  private toGetResponse(job: Job) {
    return {
      jobId: job.id,
      status: job.status,
      uploadKey: job.originalKey,
      resultKey: job.resultKey,
      resultUrl: job.resultKey ?  `${this.config.publicBaseUrl}/${this.config.resultPath}/${job.id}` : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      error: job.error,
    };
  }
}