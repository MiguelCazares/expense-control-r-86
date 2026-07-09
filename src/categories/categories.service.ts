import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { DEFAULT_EXPENSE_CATEGORIES } from './constants/default-categories';
import {
  buildPaginatedResponse,
  PaginatedResponseDto,
} from 'src/common/dto/pagination-response.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(
    dto: CreateCategoryDto,
    ownerId: number,
  ): Promise<CategoryEntity> {
    const slug = this.slugify(dto.name);
    if (!slug) {
      throw new BadRequestException(
        'name must contain alphanumeric characters',
      );
    }

    const existing = await this.categoryRepository.findOne({
      where: { slug, ownerId },
    });
    if (existing) {
      throw new BadRequestException('A category with this name already exists');
    }

    const category = this.categoryRepository.create({
      name: dto.name,
      slug,
      color: dto.color,
      ownerId,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(
    ownerId: number,
    query: CategoryQueryDto,
  ): Promise<PaginatedResponseDto<CategoryEntity>> {
    const { page = 1, limit = 10, search, active } = query;

    const where: Record<string, unknown> = { ownerId };
    if (active !== undefined) where.active = active;
    if (search) where.name = Like(`%${search}%`);

    const [data, total] = await this.categoryRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number, ownerId: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) throw new NotFoundException('Category not found');
    if (category.ownerId !== ownerId) throw new ForbiddenException();

    return category;
  }

  /**
   * Resolves a category that can still be assigned to an expense. Inactive
   * categories stay readable on historical expenses but reject new ones.
   */
  async findActive(id: number, ownerId: number): Promise<CategoryEntity> {
    const category = await this.findOne(id, ownerId);
    if (!category.active) {
      throw new BadRequestException('This category is no longer active');
    }
    return category;
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
    ownerId: number,
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id, ownerId);

    if (dto.name && dto.name !== category.name) {
      const slug = this.slugify(dto.name);
      if (!slug) {
        throw new BadRequestException(
          'name must contain alphanumeric characters',
        );
      }
      if (slug !== category.slug) {
        const existing = await this.categoryRepository.findOne({
          where: { slug, ownerId },
        });
        if (existing) {
          throw new BadRequestException(
            'A category with this name already exists',
          );
        }
        category.slug = slug;
      }
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const category = await this.findOne(id, ownerId);
    category.active = false;
    await this.categoryRepository.save(category);
  }

  /** Gives a freshly registered owner the same starting set the enum had. */
  async seedDefaults(ownerId: number): Promise<CategoryEntity[]> {
    const categories = DEFAULT_EXPENSE_CATEGORIES.map((category) =>
      this.categoryRepository.create({ ...category, ownerId }),
    );
    return this.categoryRepository.save(categories);
  }

  private slugify(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }
}
