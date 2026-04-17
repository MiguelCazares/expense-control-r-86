import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BusEntity } from './entities/bus.entity';
import { IncomeEntity } from 'src/income/entities/income.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from 'src/common/dto/pagination-response.dto';

@Injectable()
export class BusesService {
  private readonly logger = new Logger(BusesService.name);

  constructor(
    @InjectRepository(BusEntity)
    private readonly busRepository: Repository<BusEntity>,
    @InjectRepository(IncomeEntity)
    private readonly incomeRepository: Repository<IncomeEntity>,
    @InjectRepository(ExpenseEntity)
    private readonly expenseRepository: Repository<ExpenseEntity>,
  ) {}

  async create(dto: CreateBusDto, ownerId: number): Promise<BusEntity> {
    const existing = await this.busRepository.findOne({
      where: { plate: dto.plate, ownerId },
    });
    if (existing) {
      throw new BadRequestException('A bus with this plate already exists');
    }

    const bus = this.busRepository.create({ ...dto, ownerId });
    return this.busRepository.save(bus);
  }

  async findAll(
    ownerId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BusEntity>> {
    const { page = 1, limit = 10, search } = query;

    const where = search
      ? [
          { ownerId, active: true, plate: Like(`%${search}%`) },
          { ownerId, active: true, number: Like(`%${search}%`) },
          { ownerId, active: true, route: Like(`%${search}%`) },
        ]
      : { ownerId, active: true };

    const [data, total] = await this.busRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number, ownerId: number): Promise<BusEntity> {
    const bus = await this.busRepository.findOne({ where: { id } });

    if (!bus) throw new NotFoundException('Bus not found');
    if (bus.ownerId !== ownerId) throw new ForbiddenException();

    return bus;
  }

  async update(
    id: number,
    dto: UpdateBusDto,
    ownerId: number,
  ): Promise<BusEntity> {
    const bus = await this.findOne(id, ownerId);

    if (dto.plate && dto.plate !== bus.plate) {
      const existing = await this.busRepository.findOne({
        where: { plate: dto.plate, ownerId },
      });
      if (existing) {
        throw new BadRequestException('A bus with this plate already exists');
      }
    }

    Object.assign(bus, dto);
    return this.busRepository.save(bus);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const bus = await this.findOne(id, ownerId);
    bus.active = false;
    await this.busRepository.save(bus);
  }

  async getMonthlySummary(id: number, ownerId: number, month: string) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException(
        'month query param is required in YYYY-MM format',
      );
    }

    const bus = await this.findOne(id, ownerId);

    // month format: "2026-04"
    const [year, mon] = month.split('-').map(Number);
    const dateFrom = `${month}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const dateTo = `${month}-${String(lastDay).padStart(2, '0')}`;

    const incomeRows = await this.incomeRepository
      .createQueryBuilder('income')
      .where('income.bus_id = :busId', { busId: bus.id })
      .andWhere('income.date >= :dateFrom', { dateFrom })
      .andWhere('income.date <= :dateTo', { dateTo })
      .getMany();

    const expenseRows = await this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.bus_id = :busId', { busId: bus.id })
      .andWhere('expense.date >= :dateFrom', { dateFrom })
      .andWhere('expense.date <= :dateTo', { dateTo })
      .getMany();

    const totalIncome = incomeRows.reduce(
      (sum, i) => sum + Number(i.amount),
      0,
    );
    const totalExpenses = expenseRows.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    return {
      bus,
      month,
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      profit: Number((totalIncome - totalExpenses).toFixed(2)),
      incomeRecords: incomeRows.length,
      expenseRecords: expenseRows.length,
    };
  }
}
