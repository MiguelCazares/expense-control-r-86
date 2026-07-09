import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { BusesService } from 'src/buses/buses.service';
import { CategoriesService } from 'src/categories/categories.service';
import { ShiftsService } from 'src/shifts/shifts.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from 'src/common/dto/pagination-response.dto';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly expenseRepository: Repository<ExpenseEntity>,
    private readonly busesService: BusesService,
    private readonly categoriesService: CategoriesService,
    private readonly shiftsService: ShiftsService,
  ) {}

  async create(dto: CreateExpenseDto, ownerId: number): Promise<ExpenseEntity> {
    const bus = await this.busesService.findOne(dto.busId, ownerId);
    const category = await this.categoriesService.findActive(
      dto.categoryId,
      ownerId,
    );

    if (dto.shiftId) {
      await this.shiftsService.findOne(dto.shiftId, ownerId);
    }

    const expense = this.expenseRepository.create({
      busId: bus.id,
      date: dto.date,
      amount: dto.amount,
      categoryId: category.id,
      description: dto.description,
      shiftId: dto.shiftId,
    });
    return this.expenseRepository.save(expense);
  }

  async findAll(
    ownerId: number,
    query: ExpenseQueryDto,
  ): Promise<PaginatedResponseDto<ExpenseEntity>> {
    const { page = 1, limit = 10, busId, categoryId, dateFrom, dateTo } = query;

    const qb: SelectQueryBuilder<ExpenseEntity> = this.expenseRepository
      .createQueryBuilder('expense')
      .innerJoin('expense.bus', 'bus')
      .innerJoinAndSelect('expense.category', 'category')
      .where('bus.owner_id = :ownerId', { ownerId })
      .andWhere('bus.active = true')
      .addSelect(['bus.id', 'bus.plate', 'bus.number', 'bus.route']);

    if (busId) {
      qb.andWhere('expense.bus_id = :busId', { busId });
    }
    if (categoryId) {
      qb.andWhere('expense.category_id = :categoryId', { categoryId });
    }
    if (dateFrom) {
      qb.andWhere('expense.date >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      qb.andWhere('expense.date <= :dateTo', { dateTo });
    }

    qb.orderBy('expense.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number, ownerId: number): Promise<ExpenseEntity> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['bus', 'category'],
    });

    if (!expense) throw new NotFoundException('Expense record not found');
    if (expense.bus.ownerId !== ownerId) throw new ForbiddenException();

    return expense;
  }

  async update(
    id: number,
    dto: UpdateExpenseDto,
    ownerId: number,
  ): Promise<ExpenseEntity> {
    const expense = await this.findOne(id, ownerId);

    if (dto.busId) {
      await this.busesService.findOne(dto.busId, ownerId);
    }

    if (dto.shiftId) {
      await this.shiftsService.findOne(dto.shiftId, ownerId);
    }

    Object.assign(expense, dto);

    if (dto.categoryId && dto.categoryId !== expense.category.id) {
      // The loaded relation wins over categoryId on save, so replace it too.
      expense.category = await this.categoriesService.findActive(
        dto.categoryId,
        ownerId,
      );
    }

    return this.expenseRepository.save(expense);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const expense = await this.findOne(id, ownerId);
    await this.expenseRepository.remove(expense);
  }
}
