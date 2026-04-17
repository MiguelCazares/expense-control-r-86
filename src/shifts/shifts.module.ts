import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftEntity } from './entities/shift.entity';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { DriversModule } from 'src/drivers/drivers.module';
import { BusesModule } from 'src/buses/buses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShiftEntity]),
    DriversModule,
    BusesModule,
  ],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
