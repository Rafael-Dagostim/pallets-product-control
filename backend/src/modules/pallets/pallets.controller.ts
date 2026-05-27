import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@generated/prisma';
import { Roles } from '@shared/decorators';
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
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreatePalletDto) {
    return this.createPallet.execute(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll() {
    return this.findAllPallets.execute();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.findOnePallet.execute(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePalletDto,
  ) {
    return this.updatePallet.execute(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.removePallet.execute(id);
  }
}
