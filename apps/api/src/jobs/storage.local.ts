import { promises as fs } from 'fs';
import * as path from 'path';

const ROOT = path.resolve(process.cwd(), 'tmp');

export function uploadPath(jobId: string) {
  return path.join(ROOT, 'uploads', jobId, 'original.bin');
}

export function resultPath(jobId: string) {
  return path.join(ROOT, 'results', jobId, 'result.json');
}

export async function ensureDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function writeFile(filePath: string, data: Buffer) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, data);
}

export async function readFileIfExists(filePath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(filePath);
  } catch (e: any) {
    if (e?.code === 'ENOENT') return null;
    throw e;
  }
}