import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  JsonResponse,
  ResponseHelper,
} from '@miguelcazares/nestjs-response-helper';
import { CurrentOwner } from 'src/common/decorators/current-owner.decorator';
import { OwnerEntity } from 'src/owners/entities/owner.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { BusEntity } from './entities/bus.entity';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';

@ApiTags('Buses')
@ApiBearerAuth()
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bus' })
  async create(
    @Body() dto: CreateBusDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ bus: BusEntity }>> {
    const bus = await this.busesService.create(dto, owner.id);
    return ResponseHelper.jsendSuccess({ bus }, HttpStatus.CREATED);
  }

  @Get()
  @ApiOperation({ summary: 'List all buses for the authenticated owner' })
  async findAll(
    @Query() query: PaginationQueryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<PaginatedResponseDto<BusEntity>>> {
    const result = await this.busesService.findAll(owner.id, query);
    return ResponseHelper.jsendSuccess(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bus by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ bus: BusEntity }>> {
    const bus = await this.busesService.findOne(id, owner.id);
    return ResponseHelper.jsendSuccess({ bus });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bus' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBusDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ bus: BusEntity }>> {
    const bus = await this.busesService.update(id, dto, owner.id);
    return ResponseHelper.jsendSuccess({ bus });
  }

  @Get(':id/summary')
  @ApiOperation({
    summary: 'Get monthly summary for a bus (income, expenses, profit)',
  })
  @ApiQuery({
    name: 'month',
    example: '2026-04',
    description: 'Month in YYYY-MM format',
  })
  async getMonthlySummary(
    @Param('id', ParseIntPipe) id: number,
    @Query('month') month: string,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<any>> {
    const summary = await this.busesService.getMonthlySummary(
      id,
      owner.id,
      month,
    );
    return ResponseHelper.jsendSuccess({ summary });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a bus (soft delete)' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<null>> {
    await this.busesService.remove(id, owner.id);
    return ResponseHelper.jsendSuccess(null);
  }
}
