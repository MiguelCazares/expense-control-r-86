import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { IncomeEntity } from './entities/income.entity';
import { BusesService } from 'src/buses/buses.service';
import { ShiftsService } from 'src/shifts/shifts.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from 'src/common/dto/pagination-response.dto';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(IncomeEntity)
    private readonly incomeRepository: Repository<IncomeEntity>,
    private readonly busesService: BusesService,
    private readonly shiftsService: ShiftsService,
  ) {}

  async create(dto: CreateIncomeDto, ownerId: number): Promise<IncomeEntity> {
    // Verify the bus belongs to this owner
    const bus = await this.busesService.findOne(dto.busId, ownerId);

    if (dto.shiftId) {
      await this.shiftsService.findOne(dto.shiftId, ownerId);
    }

    const income = this.incomeRepository.create({
      busId: bus.id,
      date: dto.date,
      amount: dto.amount,
      notes: dto.notes,
      shiftId: dto.shiftId,
    });
    return this.incomeRepository.save(income);
  }

  async findAll(
    ownerId: number,
    query: IncomeQueryDto,
  ): Promise<PaginatedResponseDto<IncomeEntity>> {
    const { page = 1, limit = 10, busId, dateFrom, dateTo } = query;

    const qb: SelectQueryBuilder<IncomeEntity> = this.incomeRepository
      .createQueryBuilder('income')
      .innerJoin('income.bus', 'bus')
      .where('bus.owner_id = :ownerId', { ownerId })
      .andWhere('bus.active = true')
      .addSelect(['bus.id', 'bus.plate', 'bus.number', 'bus.route']);

    if (busId) {
      qb.andWhere('income.bus_id = :busId', { busId });
    }
    if (dateFrom) {
      qb.andWhere('income.date >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      qb.andWhere('income.date <= :dateTo', { dateTo });
    }

    qb.orderBy('income.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number, ownerId: number): Promise<IncomeEntity> {
    const income = await this.incomeRepository.findOne({
      where: { id },
      relations: ['bus'],
    });

    if (!income) throw new NotFoundException('Income record not found');
    if (income.bus.ownerId !== ownerId) throw new ForbiddenException();

    return income;
  }

  async update(
    id: number,
    dto: UpdateIncomeDto,
    ownerId: number,
  ): Promise<IncomeEntity> {
    const income = await this.findOne(id, ownerId);

    if (dto.busId) {
      await this.busesService.findOne(dto.busId, ownerId);
    }

    Object.assign(income, dto);
    return this.incomeRepository.save(income);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const income = await this.findOne(id, ownerId);
    await this.incomeRepository.remove(income);
  }
}
