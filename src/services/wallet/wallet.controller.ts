import { Controller, Get, Post, Body, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.model';
import { WalletsQueryDto } from './dto/wallet.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { createApiResponse, successResponse } from '../../common/utility';
import { WalletAddressDto } from './dto/walletAddress.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Buffer } from 'buffer';
import { Express } from 'express';

@ApiTags('wallet')
@Controller('Wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @createApiResponse({status:200, description:'successful',type: Wallet, isArray: true,})
  async wallets(@Query() query: WalletsQueryDto) {
    const wallets= await this.walletService.getAll();
    return successResponse(this.walletService.walletSort(wallets,query))
  }

  @Get('address')
  @createApiResponse({status:200, description:'successful',type: Wallet, isArray: false,})
  async getWallet(@Query() query: WalletAddressDto) {
    return successResponse(await this.walletService.get(query.address));
  }

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  @createApiResponse({status:200, description:' successful'})
  async analyzeFileData(@UploadedFile() file: Express.Multer.File) {
    try {
      // Check if a file is uploaded
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Read the file buffer
      const fileBuffer = file.buffer;  // This contains the file data as a Buffer

      // Convert Buffer to string
      const fileContent = fileBuffer.toString('utf-8');

      // Parse the JSON content
      const jsonData = JSON.parse(fileContent);
      const wallets = this.walletService.analyzeData(jsonData)
      // await this.walletService.bulkCreateWallet(wallets)

      // Process or return the parsed JSON data
      return successResponse('File uploaded and JSON content parsed successfully')
    } catch (error) {
      console.log('error',error)
      throw new BadRequestException(error);
    }
  }
}
