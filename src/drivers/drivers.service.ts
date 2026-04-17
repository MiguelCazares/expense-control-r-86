import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { DriverEntity } from './entities/driver.entity';
import { DriverAssignmentEntity } from './entities/driver-assignment.entity';
import { BusesService } from 'src/buses/buses.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from 'src/common/dto/pagination-response.dto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(
    @InjectRepository(DriverEntity)
    private readonly driverRepository: Repository<DriverEntity>,
    @InjectRepository(DriverAssignmentEntity)
    private readonly assignmentRepository: Repository<DriverAssignmentEntity>,
    private readonly busesService: BusesService,
  ) {}

  async create(dto: CreateDriverDto, ownerId: number): Promise<DriverEntity> {
    const existing = await this.driverRepository.findOne({
      where: { license: dto.license },
    });
    if (existing) {
      throw new BadRequestException(
        'A driver with this license already exists',
      );
    }

    const driver = this.driverRepository.create({ ...dto, ownerId });
    return this.driverRepository.save(driver);
  }

  async findAll(
    ownerId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<DriverEntity>> {
    const { page = 1, limit = 10, search } = query;

    const where = search
      ? [
          { ownerId, active: true, name: Like(`%${search}%`) },
          { ownerId, active: true, lastName: Like(`%${search}%`) },
          { ownerId, active: true, license: Like(`%${search}%`) },
        ]
      : { ownerId, active: true };

    const [data, total] = await this.driverRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number, ownerId: number): Promise<DriverEntity> {
    const driver = await this.driverRepository.findOne({ where: { id } });

    if (!driver) throw new NotFoundException('Driver not found');
    if (driver.ownerId !== ownerId) throw new ForbiddenException();

    return driver;
  }

  async update(
    id: number,
    dto: UpdateDriverDto,
    ownerId: number,
  ): Promise<DriverEntity> {
    const driver = await this.findOne(id, ownerId);

    if (dto.license && dto.license !== driver.license) {
      const existing = await this.driverRepository.findOne({
        where: { license: dto.license },
      });
      if (existing) {
        throw new BadRequestException(
          'A driver with this license already exists',
        );
      }
    }

    Object.assign(driver, dto);
    return this.driverRepository.save(driver);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const driver = await this.findOne(id, ownerId);
    driver.active = false;
    await this.driverRepository.save(driver);
  }

  async createAssignment(
    driverId: number,
    dto: CreateAssignmentDto,
    ownerId: number,
  ): Promise<DriverAssignmentEntity> {
    const driver = await this.findOne(driverId, ownerId);

    // Verify the bus belongs to the same owner
    const bus = await this.busesService.findOne(dto.busId, ownerId);

    const existing = await this.assignmentRepository.findOne({
      where: { driverId: driver.id, busId: bus.id, date: dto.date },
    });
    if (existing) {
      throw new BadRequestException(
        'This driver is already assigned to this bus on that date',
      );
    }

    const assignment = this.assignmentRepository.create({
      driverId: driver.id,
      busId: bus.id,
      date: dto.date,
    });
    return this.assignmentRepository.save(assignment);
  }

  async findAssignments(
    driverId: number,
    ownerId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<DriverAssignmentEntity>> {
    const { page = 1, limit = 10 } = query;

    await this.findOne(driverId, ownerId);

    const [data, total] = await this.assignmentRepository.findAndCount({
      where: { driverId },
      relations: ['bus'],
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' },
    });

    return buildPaginatedResponse(data, total, page, limit);
  }
}
