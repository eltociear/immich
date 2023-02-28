import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  query?: string;
}
