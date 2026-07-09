import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  JsonResponse,
  ResponseHelper,
} from '@miguelcazares/nestjs-response-helper';
import { CurrentOwner } from 'src/common/decorators/current-owner.decorator';
import { OwnerEntity } from 'src/owners/entities/owner.entity';
import { CashFlowService, CashFlowSummary } from './cash-flow.service';
import { CashFlowQueryDto } from './dto/cash-flow-query.dto';

@ApiTags('Cash Flow')
@ApiBearerAuth()
@Controller('cash-flow')
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get business-wide cash flow for a date range (income vs expenses), optionally filtered by bus',
  })
  async getSummary(
    @Query() query: CashFlowQueryDto,
    @CurrentOwner() owner: OwnerEntity,
  ): Promise<JsonResponse<{ cashFlow: CashFlowSummary }>> {
    const cashFlow = await this.cashFlowService.getSummary(owner.id, query);
    return ResponseHelper.jsendSuccess({ cashFlow });
  }
}
