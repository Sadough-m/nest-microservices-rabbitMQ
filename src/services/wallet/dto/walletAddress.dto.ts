import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';


export class WalletAddressDto {
  @ApiProperty({ description: 'wallet address key', type: String, })
  address: string;

}