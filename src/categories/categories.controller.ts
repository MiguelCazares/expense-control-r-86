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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryEntity } from './entities/category.entity';

@ApiTags('Expense categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an expense category' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ category: CategoryEntity }>> {
    const category = await this.categoriesService.create(dto, owner.id);
    return ResponseHelper.jsendSuccess({ category }, HttpStatus.CREATED);
  }

  @Get()
  @ApiOperation({
    summary: 'List expense categories for the authenticated owner',
  })
  async findAll(
    @Query() query: CategoryQueryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<PaginatedResponseDto<CategoryEntity>>> {
    const result = await this.categoriesService.findAll(owner.id, query);
    return ResponseHelper.jsendSuccess(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense category by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ category: CategoryEntity }>> {
    const category = await this.categoriesService.findOne(id, owner.id);
    return ResponseHelper.jsendSuccess({ category });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense category' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ category: CategoryEntity }>> {
    const category = await this.categoriesService.update(id, dto, owner.id);
    return ResponseHelper.jsendSuccess({ category });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deactivate an expense category (soft delete)',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<null>> {
    await this.categoriesService.remove(id, owner.id);
    return ResponseHelper.jsendSuccess(null);
  }
}
