import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DriverEntity } from './driver.entity';
import { BusEntity } from 'src/buses/entities/bus.entity';

@Entity('driver_assignments')
export class DriverAssignmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ default: true })
  active: boolean;

  @Index()
  @ManyToOne(() => DriverEntity, { nullable: false })
  @JoinColumn({ name: 'driver_id' })
  driver: DriverEntity;

  @Column({ name: 'driver_id' })
  driverId: number;

  @Index()
  @ManyToOne(() => BusEntity, { nullable: false })
  @JoinColumn({ name: 'bus_id' })
  bus: BusEntity;

  @Column({ name: 'bus_id' })
  busId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
