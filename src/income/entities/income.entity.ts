import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BusEntity } from 'src/buses/entities/bus.entity';
import { ShiftEntity } from 'src/shifts/entities/shift.entity';

@Entity('income')
export class IncomeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Index()
  @ManyToOne(() => BusEntity, { nullable: false })
  @JoinColumn({ name: 'bus_id' })
  bus: BusEntity;

  @Column({ name: 'bus_id' })
  busId: number;

  @Index()
  @ManyToOne(() => ShiftEntity, (shift) => shift.income, { nullable: true })
  @JoinColumn({ name: 'shift_id' })
  shift: ShiftEntity;

  @Column({ name: 'shift_id', nullable: true })
  shiftId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
