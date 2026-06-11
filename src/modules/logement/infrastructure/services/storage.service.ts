import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from '../../domain/ports/photo.repository.port';

@Injectable()
export class StorageService implements IStorageService {
  constructor(private readonly config: ConfigService) {}

  async upload(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
    const bucket = this.config.get<string>('AWS_S3_BUCKET') ?? 'resa-dev';
    const key = `photos/${Date.now()}-${filename}`;
    const region = this.config.get<string>('AWS_REGION') ?? 'eu-west-3';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  async delete(_url: string): Promise<void> {
    // stub — implement with AWS SDK in production
  }
}
