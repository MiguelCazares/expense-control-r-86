import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  JsonResponse,
  ResponseHelper,
} from '@miguelcazares/nestjs-response-helper';
import { CurrentOwner } from 'src/common/decorators/current-owner.decorator';
import { OwnersService } from './owners.service';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { OwnerEntity } from './entities/owner.entity';

@ApiTags('Owners')
@ApiBearerAuth()
@Controller('owners')
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get the authenticated owner profile' })
  getProfile(
    @CurrentOwner() owner: OwnerEntity,
  ): JsonResponse<{ owner: OwnerEntity }> {
    return ResponseHelper.jsendSuccess({ owner });
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update name or email' })
  async updateProfile(
    @Body() dto: UpdateOwnerDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ owner: OwnerEntity }>> {
    const updated = await this.ownersService.update(owner.id, dto);
    return ResponseHelper.jsendSuccess({ owner: updated });
  }
}
