import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusEntity } from './entities/bus.entity';
import { BusesService } from './buses.service';
import { BusesController } from './buses.controller';
import { IncomeEntity } from 'src/income/entities/income.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusEntity, IncomeEntity, ExpenseEntity])],
  controllers: [BusesController],
  providers: [BusesService],
  exports: [BusesService],
})
export class BusesModule {}
