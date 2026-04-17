import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeEntity } from './entities/income.entity';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import { BusesModule } from 'src/buses/buses.module';
import { ShiftsModule } from 'src/shifts/shifts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeEntity]),
    BusesModule,
    ShiftsModule,
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}
