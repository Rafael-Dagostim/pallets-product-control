import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreatePalletDto } from './dto/create-pallet.dto';
import { UpdatePalletDto } from './dto/update-pallet.dto';
import {
  CreatePalletService,
  FindAllPalletsService,
  FindOnePalletService,
  UpdatePalletService,
  RemovePalletService,
} from './services';

@Controller('pallets')
@ApiBearerAuth()
export class PalletsController {
  constructor(
    private readonly createPallet: CreatePalletService,
    private readonly findAllPallets: FindAllPalletsService,
    private readonly findOnePallet: FindOnePalletService,
    private readonly updatePallet: UpdatePalletService,
    private readonly removePallet: RemovePalletService,
  ) {}

  @Post()
  create(@Body() dto: CreatePalletDto) {
    return this.createPallet.execute(dto);
  }

  @Get()
  findAll() {
    return this.findAllPallets.execute();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findOnePallet.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePalletDto,
  ) {
    return this.updatePallet.execute(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.removePallet.execute(id);
  }
}
