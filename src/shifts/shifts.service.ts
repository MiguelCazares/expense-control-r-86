import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ShiftEntity } from './entities/shift.entity';
import { ShiftStatus } from './enums/shift-status.enum';
import { DriversService } from 'src/drivers/drivers.service';
import { BusesService } from 'src/buses/buses.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftQueryDto } from './dto/shift-query.dto';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from 'src/common/dto/pagination-response.dto';

export interface ShiftSummary {
  shift: ShiftEntity;
  totalIncome: number;
  totalExpenses: number;
  profit: number;
}

@Injectable()
export class ShiftsService {
  private readonly logger = new Logger(ShiftsService.name);

  constructor(
    @InjectRepository(ShiftEntity)
    private readonly shiftRepository: Repository<ShiftEntity>,
    private readonly driversService: DriversService,
    private readonly busesService: BusesService,
  ) {}

  async create(dto: CreateShiftDto, ownerId: number): Promise<ShiftEntity> {
    await this.driversService.findOne(dto.driverId, ownerId);
    await this.busesService.findOne(dto.busId, ownerId);

    const shift = this.shiftRepository.create({ ...dto, ownerId });
    return this.shiftRepository.save(shift);
  }

  async findAll(
    ownerId: number,
    query: ShiftQueryDto,
  ): Promise<PaginatedResponseDto<ShiftEntity>> {
    const { page = 1, limit = 10, driverId, busId, dateFrom, dateTo } = query;

    const qb: SelectQueryBuilder<ShiftEntity> = this.shiftRepository
      .createQueryBuilder('shift')
      .leftJoinAndSelect('shift.driver', 'driver')
      .leftJoinAndSelect('shift.bus', 'bus')
      .where('shift.owner_id = :ownerId', { ownerId });

    if (driverId) qb.andWhere('shift.driver_id = :driverId', { driverId });
    if (busId) qb.andWhere('shift.bus_id = :busId', { busId });
    if (dateFrom) qb.andWhere('shift.date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('shift.date <= :dateTo', { dateTo });

    qb.orderBy('shift.date', 'DESC')
      .addOrderBy('shift.startTime', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number, ownerId: number): Promise<ShiftEntity> {
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['driver', 'bus', 'income', 'expenses', 'expenses.category'],
    });

    if (!shift) throw new NotFoundException('Shift not found');
    if (shift.ownerId !== ownerId) throw new ForbiddenException();

    return shift;
  }

  async update(
    id: number,
    dto: UpdateShiftDto,
    ownerId: number,
  ): Promise<ShiftEntity> {
    const shift = await this.findOne(id, ownerId);

    if (dto.driverId) await this.driversService.findOne(dto.driverId, ownerId);
    if (dto.busId) await this.busesService.findOne(dto.busId, ownerId);

    Object.assign(shift, dto);

    // Auto-close when endTime is provided
    if (dto.endTime && shift.status === ShiftStatus.OPEN) {
      shift.status = ShiftStatus.CLOSED;
    }

    return this.shiftRepository.save(shift);
  }

  async getSummary(id: number, ownerId: number): Promise<ShiftSummary> {
    const shift = await this.findOne(id, ownerId);

    const totalIncome = shift.income.reduce(
      (sum, i) => sum + Number(i.amount),
      0,
    );
    const totalExpenses = shift.expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    return {
      shift,
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      profit: Number((totalIncome - totalExpenses).toFixed(2)),
    };
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const shift = await this.shiftRepository.findOne({ where: { id } });

    if (!shift) throw new NotFoundException('Shift not found');
    if (shift.ownerId !== ownerId) throw new ForbiddenException();

    await this.shiftRepository.remove(shift);
  }
}
