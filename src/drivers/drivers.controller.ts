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
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { DriverEntity } from './entities/driver.entity';
import { DriverAssignmentEntity } from './entities/driver-assignment.entity';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new driver' })
  async create(
    @Body() dto: CreateDriverDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ driver: DriverEntity }>> {
    const driver = await this.driversService.create(dto, owner.id);
    return ResponseHelper.jsendSuccess({ driver }, HttpStatus.CREATED);
  }

  @Get()
  @ApiOperation({ summary: 'List all drivers for the authenticated owner' })
  async findAll(
    @Query() query: PaginationQueryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<PaginatedResponseDto<DriverEntity>>> {
    const result = await this.driversService.findAll(owner.id, query);
    return ResponseHelper.jsendSuccess(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a driver by ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ driver: DriverEntity }>> {
    const driver = await this.driversService.findOne(id, owner.id);
    return ResponseHelper.jsendSuccess({ driver });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a driver' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDriverDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ driver: DriverEntity }>> {
    const driver = await this.driversService.update(id, dto, owner.id);
    return ResponseHelper.jsendSuccess({ driver });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a driver (soft delete)' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<null>> {
    await this.driversService.remove(id, owner.id);
    return ResponseHelper.jsendSuccess(null);
  }

  @Post(':id/assignments')
  @ApiOperation({ summary: 'Assign a driver to a bus on a specific date' })
  async createAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAssignmentDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ assignment: DriverAssignmentEntity }>> {
    const assignment = await this.driversService.createAssignment(
      id,
      dto,
      owner.id,
    );
    return ResponseHelper.jsendSuccess({ assignment }, HttpStatus.CREATED);
  }

  @Get(':id/assignments')
  @ApiOperation({ summary: 'List all assignments for a driver' })
  async findAssignments(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<PaginatedResponseDto<DriverAssignmentEntity>>> {
    const result = await this.driversService.findAssignments(
      id,
      owner.id,
      query,
    );
    return ResponseHelper.jsendSuccess(result);
  }
}
