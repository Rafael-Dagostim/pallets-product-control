import { Module } from '@nestjs/common';
import { PalletsController } from './pallets.controller';
import {
  CreatePalletService,
  FindAllPalletsService,
  FindOnePalletService,
  UpdatePalletService,
  RemovePalletService,
} from './services';

@Module({
  controllers: [PalletsController],
  providers: [
    CreatePalletService,
    FindAllPalletsService,
    FindOnePalletService,
    UpdatePalletService,
    RemovePalletService,
  ],
})
export class PalletsModule {}
