import { Controller, Get, Param, Put, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { JobsService } from './jobs.service';
import { readFileIfExists, resultPath } from './storage.local';

@Controller('/dev')
export class DevController {
  constructor(private readonly jobs: JobsService) {}

  // PUT /dev/upload/:jobId
  // принимает raw bytes (Content-Type: application/octet-stream)
  @Put('/upload/:jobId')
  async upload(@Param('jobId') jobId: string, @Req() req: Request, @Res() res: Response) {
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on('end', () => resolve());
      req.on('error', reject);
    });

    const body = Buffer.concat(chunks);
    const job = await this.jobs.handleDevUpload(jobId, body);

    return res.json(job);
  }

  // GET /dev/result/:jobId
  @Get('/result/:jobId')
  async getResult(@Param('jobId') jobId: string, @Res() res: Response) {
    const data = await readFileIfExists(resultPath(jobId));
    if (!data) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.send(data);
  }
}