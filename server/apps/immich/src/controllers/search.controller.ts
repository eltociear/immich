import { AuthUserDto, SearchDto, SearchResponseDto, SearchService } from '@app/domain';
import { Body, Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAuthUser } from '../decorators/auth-user.decorator';
import { Authenticated } from '../decorators/authenticated.decorator';

@ApiTags('Search')
@Authenticated()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Authenticated()
  @Get('search')
  async search(@GetAuthUser() authUser: AuthUserDto, @Body() dto: SearchDto): Promise<SearchResponseDto> {
    return this.searchService.search(authUser, dto);
  }
}
