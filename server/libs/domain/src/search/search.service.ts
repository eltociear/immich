import { AlbumEntity, AssetEntity } from '@app/infra/db/entities';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { IAlbumRepository } from '../album/album.repository';
import { IAssetRepository } from '../asset/asset.repository';
import { AuthUserDto } from '../auth';
import { IJobRepository, JobName } from '../job';
import { SearchResponseDto } from './response-dto';
import { ISearchRepository, SearchCollection } from './search.repository';

@Injectable()
export class SearchService {
  private logger = new Logger(SearchService.name);

  constructor(
    @Inject(IJobRepository) private jobRepository: IJobRepository,
    @Inject(ISearchRepository) private searchRepository: ISearchRepository,
    @Inject(IAssetRepository) private assetRepository: IAssetRepository,
    @Inject(IAlbumRepository) private albumRepository: IAlbumRepository,
  ) {}

  async bootstrap() {
    await this.searchRepository.setup();

    const migrationStatus = await this.searchRepository.checkMigrationStatus();
    if (migrationStatus[SearchCollection.ASSETS]) {
      await this.jobRepository.queue({ name: JobName.SEARCH_INDEX_ASSETS });
    }
  }

  async search(authUser: AuthUserDto, dto: any): Promise<SearchResponseDto> {
    console.log(dto);

    const query: string = dto.query;

    return {
      assets: (await this.searchRepository.search(SearchCollection.ASSETS, query, { userId: authUser.id })) as any,
      albums: (await this.searchRepository.search(SearchCollection.ALBUMS, query, { userId: authUser.id })) as any,
    };
  }

  async indexAssets() {
    try {
      // TODO: do this in batches based on searchIndexVersion

      const assets = await this.assetRepository.getAll({ isVisible: true });

      this.logger.log(`Indexing ${assets.length} assets`);
      await this.searchRepository.import(SearchCollection.ASSETS, assets, true);
    } catch (error: any) {
      this.logger.error(`Unable to index assets: ${error}`, error?.stack);
    }
  }

  async indexAsset(asset: AssetEntity) {
    await this.searchRepository.index(SearchCollection.ASSETS, asset);
  }

  async indexAlbums() {
    try {
      const albums = await this.albumRepository.getAll();
      this.logger.log(`Indexing ${albums.length} albums`);
      await this.searchRepository.import(SearchCollection.ALBUMS, albums, true);
    } catch (error: any) {
      this.logger.error(`Unable to index assets: ${error}`, error?.stack);
    }
  }

  async indexAlbum(album: AlbumEntity) {
    await this.searchRepository.index(SearchCollection.ALBUMS, album);
  }
}
