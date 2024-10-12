import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum SortFiled {
  'total_profit' = 'total_profit',
  'num_tokens_traded' = 'num_tokens_traded',
  'num_active_days' = 'num_active_days'
}
export enum Order {
  asc = 'asc',
  desc = 'desc',
}

export class WalletsQueryDto {
  @ApiPropertyOptional({ description: 'sort by', enum: SortFiled, type: String })
  @IsOptional()
  @IsEnum(SortFiled)
  @Transform(({ value }) => value.toLowerCase())
  sort_by?: SortFiled;

  @ApiProperty({ description: 'sort order', enum: Order, type: String })
  @IsEnum(Order)
  @Transform(({ value }) => value.toLowerCase())
  order: Order
}