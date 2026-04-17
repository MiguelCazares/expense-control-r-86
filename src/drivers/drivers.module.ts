import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverEntity } from './entities/driver.entity';
import { DriverAssignmentEntity } from './entities/driver-assignment.entity';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { BusesModule } from 'src/buses/buses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DriverEntity, DriverAssignmentEntity]),
    BusesModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
