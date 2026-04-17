import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OwnerEntity } from './entities/owner.entity';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnersService {
  private readonly logger = new Logger(OwnersService.name);

  constructor(
    @InjectRepository(OwnerEntity)
    private readonly ownerRepository: Repository<OwnerEntity>,
  ) {}

  async create(dto: CreateOwnerDto): Promise<OwnerEntity> {
    const existing = await this.ownerRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException(
        'An account with this email already exists',
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const owner = this.ownerRepository.create({ ...dto, password: hashed });
    return this.ownerRepository.save(owner);
  }

  async findByEmail(email: string): Promise<OwnerEntity | null> {
    return this.ownerRepository.findOne({ where: { email, active: true } });
  }

  async findById(id: number): Promise<OwnerEntity> {
    const owner = await this.ownerRepository.findOne({
      where: { id, active: true },
    });
    if (!owner) throw new NotFoundException('Owner not found');
    return owner;
  }

  async update(id: number, dto: UpdateOwnerDto): Promise<OwnerEntity> {
    const owner = await this.findById(id);

    if (dto.email && dto.email !== owner.email) {
      const existing = await this.ownerRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(owner, dto);
    return this.ownerRepository.save(owner);
  }
}
