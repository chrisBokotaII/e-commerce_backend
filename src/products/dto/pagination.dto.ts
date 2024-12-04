import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class paginationProdDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit: number = 10;
  @IsOptional()
  @IsString()
  sort: 'ASC' | 'DESC';
  @IsOptional()
  @IsString()
  search?: string;
}
