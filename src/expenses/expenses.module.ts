import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { BusesModule } from 'src/buses/buses.module';
import { ShiftsModule } from 'src/shifts/shifts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseEntity]),
    BusesModule,
    ShiftsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
