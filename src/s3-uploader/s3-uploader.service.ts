import { Injectable } from '@nestjs/common';
import AWSUtil from './util/AwsUtil';
import ImageUtil from './util/ImageUtil';
import UrlUtil from './util/UrlUtil';

@Injectable()
export class S3UploaderService {
  async uploadFileToS3(file: any, folder: string) {
    const path = await AWSUtil.uploadFileToS3(
      file,
      folder,
      ImageUtil.customFilename(file),
      file.mimetype,
    );
    return path;
  }

  async uploadImageToS3(file: any, folder: string): Promise<string> {
    const path = await AWSUtil.uploadImageToS3(
      file,
      folder,
      ImageUtil.customFilename(file),
      file.mimetype,
    );
    return path;
  }

  async replaceImageOnS3(file: any, folder: string, url: string) {
    const path = await AWSUtil.uploadImageToS3(
      file,
      folder,
      ImageUtil.customFilename(file),
      file.mimetype,
    );

    await this.deleteFromS3(url);

    return path;
  }

  async deleteFromS3(url: string) {
    const key = UrlUtil.getKey(url);
    await AWSUtil.deleteFromS3(key);
  }
}
