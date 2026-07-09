import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeEntity } from 'src/income/entities/income.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { CashFlowService } from './cash-flow.service';
import { CashFlowController } from './cash-flow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeEntity, ExpenseEntity])],
  controllers: [CashFlowController],
  providers: [CashFlowService],
})
export class CashFlowModule {}
