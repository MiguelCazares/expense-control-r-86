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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { ExpenseEntity } from './entities/expense.entity';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Register an expense for a bus' })
  async create(
    @Body() dto: CreateExpenseDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ expense: ExpenseEntity }>> {
    const expense = await this.expensesService.create(dto, owner.id);
    return ResponseHelper.jsendSuccess({ expense }, HttpStatus.CREATED);
  }

  @Get()
  @ApiOperation({
    summary: 'List expenses (filter by busId, category, dateFrom, dateTo)',
  })
  async findAll(
    @Query() query: ExpenseQueryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<PaginatedResponseDto<ExpenseEntity>>> {
    const result = await this.expensesService.findAll(owner.id, query);
    return ResponseHelper.jsendSuccess(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense record by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ expense: ExpenseEntity }>> {
    const expense = await this.expensesService.findOne(id, owner.id);
    return ResponseHelper.jsendSuccess({ expense });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense record' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ expense: ExpenseEntity }>> {
    const expense = await this.expensesService.update(id, dto, owner.id);
    return ResponseHelper.jsendSuccess({ expense });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense record' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<null>> {
    await this.expensesService.remove(id, owner.id);
    return ResponseHelper.jsendSuccess(null);
  }
}
