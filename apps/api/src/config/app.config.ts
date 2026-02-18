import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000',
  uploadPath: process.env.DEV_UPLOAD_PATH ?? '/dev/upload',
  resultPath: process.env.DEV_RESULT_PATH ?? '/dev/result',
}));