import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
  Check,
} from 'typeorm';
import { DriverEntity } from 'src/drivers/entities/driver.entity';
import { BusEntity } from 'src/buses/entities/bus.entity';
import { OwnerEntity } from 'src/owners/entities/owner.entity';
import { IncomeEntity } from 'src/income/entities/income.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { ShiftStatus } from '../enums/shift-status.enum';

@Entity('shifts')
@Check(`"laps" IS NULL OR ("laps" >= 0 AND "laps" * 2 = FLOOR("laps" * 2))`)
export class ShiftEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', name: 'start_time' })
  startTime: string;

  @Column({ type: 'time', name: 'end_time', nullable: true })
  endTime: string;

  @Column({ type: 'enum', enum: ShiftStatus, default: ShiftStatus.OPEN })
  status: ShiftStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  laps: number;

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

  @Index()
  @ManyToOne(() => OwnerEntity, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: OwnerEntity;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @OneToMany(() => IncomeEntity, (income) => income.shift)
  income: IncomeEntity[];

  @OneToMany(() => ExpenseEntity, (expense) => expense.shift)
  expenses: ExpenseEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
