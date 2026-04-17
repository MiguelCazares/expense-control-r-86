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
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import { IncomeEntity } from './entities/income.entity';

@ApiTags('Income')
@ApiBearerAuth()
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: 'Register daily income for a bus' })
  async create(
    @Body() dto: CreateIncomeDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ income: IncomeEntity }>> {
    const income = await this.incomeService.create(dto, owner.id);
    return ResponseHelper.jsendSuccess({ income }, HttpStatus.CREATED);
  }

  @Get()
  @ApiOperation({
    summary: 'List income records (filter by busId, dateFrom, dateTo)',
  })
  async findAll(
    @Query() query: IncomeQueryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<PaginatedResponseDto<IncomeEntity>>> {
    const result = await this.incomeService.findAll(owner.id, query);
    return ResponseHelper.jsendSuccess(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an income record by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ income: IncomeEntity }>> {
    const income = await this.incomeService.findOne(id, owner.id);
    return ResponseHelper.jsendSuccess({ income });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an income record' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncomeDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ income: IncomeEntity }>> {
    const income = await this.incomeService.update(id, dto, owner.id);
    return ResponseHelper.jsendSuccess({ income });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an income record' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<null>> {
    await this.incomeService.remove(id, owner.id);
    return ResponseHelper.jsendSuccess(null);
  }
}
