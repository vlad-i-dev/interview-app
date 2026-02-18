export type JobStatus =
  | 'NEW'
  | 'UPLOAD_URL_ISSUED'
  | 'UPLOADED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'DONE'
  | 'FAILED';

export interface Job {
  id: string;
  status: JobStatus;

  originalKey?: string;
  resultKey?: string;

  idempotencyKey?: string;

  createdAt: string;
  updatedAt: string;

  error?: string;
}
