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
import { OwnerEntity } from 'src/owners/entities/owner.entity';

@Entity('drivers')
export class DriverEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 50 })
  license: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ default: true })
  active: boolean;

  @Index()
  @ManyToOne(() => OwnerEntity, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: OwnerEntity;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
