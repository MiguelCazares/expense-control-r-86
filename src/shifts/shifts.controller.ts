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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  JsonResponse,
  ResponseHelper,
} from '@miguelcazares/nestjs-response-helper';
import { CurrentOwner } from 'src/common/decorators/current-owner.decorator';
import { OwnerEntity } from 'src/owners/entities/owner.entity';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';
import { ShiftsService, ShiftSummary } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftQueryDto } from './dto/shift-query.dto';
import { ShiftEntity } from './entities/shift.entity';

@ApiTags('Shifts')
@ApiBearerAuth()
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Open a shift (driver + bus + date + startTime)' })
  async create(
    @Body() dto: CreateShiftDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ shift: ShiftEntity }>> {
    const shift = await this.shiftsService.create(dto, owner.id);
    return ResponseHelper.jsendSuccess({ shift }, HttpStatus.CREATED);
  }

  @Get()
  @ApiOperation({
    summary: 'List shifts (filter by driverId, busId, dateFrom, dateTo)',
  })
  async findAll(
    @Query() query: ShiftQueryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<PaginatedResponseDto<ShiftEntity>>> {
    const result = await this.shiftsService.findAll(owner.id, query);
    return ResponseHelper.jsendSuccess(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shift with its income and expenses' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ shift: ShiftEntity }>> {
    const shift = await this.shiftsService.findOne(id, owner.id);
    return ResponseHelper.jsendSuccess({ shift });
  }

  @Get(':id/summary')
  @ApiOperation({
    summary: 'Get shift summary: totalIncome, totalExpenses, profit',
  })
  async getSummary(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<ShiftSummary>> {
    const summary = await this.shiftsService.getSummary(id, owner.id);
    return ResponseHelper.jsendSuccess(summary);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shift — pass endTime to close it' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShiftDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ shift: ShiftEntity }>> {
    const shift = await this.shiftsService.update(id, dto, owner.id);
    return ResponseHelper.jsendSuccess({ shift });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shift' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<null>> {
    await this.shiftsService.remove(id, owner.id);
    return ResponseHelper.jsendSuccess(null);
  }
}
