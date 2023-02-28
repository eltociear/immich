import {
  AssetService,
  IAlbumJob,
  IAssetJob,
  IAssetUploadedJob,
  IDeleteFilesJob,
  IUserDeletionJob,
  JobName,
  MediaService,
  QueueName,
  SearchService,
  SmartInfoService,
  StorageService,
  StorageTemplateService,
  SystemConfigService,
  UserService,
} from '@app/domain';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(QueueName.BACKGROUND_TASK)
export class BackgroundTaskProcessor {
  constructor(
    private assetService: AssetService,
    private storageService: StorageService,
    private systemConfigService: SystemConfigService,
    private userService: UserService,
  ) {}

  @Process(JobName.ASSET_UPLOADED)
  async onAssetUpload(job: Job<IAssetUploadedJob>) {
    await this.assetService.handleAssetUpload(job.data);
  }

  @Process(JobName.DELETE_FILES)
  async onDeleteFile(job: Job<IDeleteFilesJob>) {
    await this.storageService.handleDeleteFiles(job.data);
  }

  @Process(JobName.SYSTEM_CONFIG_CHANGE)
  async onSystemConfigChange() {
    await this.systemConfigService.refreshConfig();
  }

  @Process(JobName.USER_DELETION)
  async onUserDelete(job: Job<IUserDeletionJob>) {
    await this.userService.handleUserDelete(job.data);
  }
}

@Processor(QueueName.MACHINE_LEARNING)
export class MachineLearningProcessor {
  constructor(private smartInfoService: SmartInfoService) {}

  @Process({ name: JobName.IMAGE_TAGGING, concurrency: 2 })
  async onTagImage(job: Job<IAssetJob>) {
    await this.smartInfoService.handleTagImage(job.data);
  }

  @Process({ name: JobName.OBJECT_DETECTION, concurrency: 2 })
  async onDetectObject(job: Job<IAssetJob>) {
    await this.smartInfoService.handleDetectObjects(job.data);
  }
}

@Processor(QueueName.SEARCH_INDEX)
export class SearchIndexProcessor {
  constructor(private searchService: SearchService) {}

  @Process({ name: JobName.SEARCH_INDEX_ASSETS, concurrency: 1 })
  async indexAssets() {
    await this.searchService.indexAssets();
  }

  @Process({ name: JobName.SEARCH_INDEX_ASSET, concurrency: 1 })
  async indexAsset(job: Job<IAssetJob>) {
    await this.searchService.indexAsset(job.data.asset);
  }

  @Process({ name: JobName.SEARCH_INDEX_ALBUMS, concurrency: 1 })
  async indexAlbums() {
    await this.searchService.indexAlbums();
  }

  @Process({ name: JobName.SEARCH_INDEX_ALBUM, concurrency: 1 })
  async indexAlbum(job: Job<IAlbumJob>) {
    await this.searchService.indexAlbum(job.data.album);
  }
}

@Processor(QueueName.STORAGE_TEMPLATE_MIGRATION)
export class StorageTemplateMigrationProcessor {
  constructor(private storageTemplateService: StorageTemplateService) {}

  @Process({ name: JobName.STORAGE_TEMPLATE_MIGRATION })
  async onTemplateMigration() {
    await this.storageTemplateService.handleTemplateMigration();
  }
}

@Processor(QueueName.THUMBNAIL_GENERATION)
export class ThumbnailGeneratorProcessor {
  constructor(private mediaService: MediaService) {}

  @Process({ name: JobName.GENERATE_JPEG_THUMBNAIL, concurrency: 3 })
  async handleGenerateJpegThumbnail(job: Job<IAssetJob>) {
    await this.mediaService.handleGenerateJpegThumbnail(job.data);
  }

  @Process({ name: JobName.GENERATE_WEBP_THUMBNAIL, concurrency: 3 })
  async handleGenerateWepbThumbnail(job: Job<IAssetJob>) {
    await this.mediaService.handleGenerateWepbThumbnail(job.data);
  }
}
