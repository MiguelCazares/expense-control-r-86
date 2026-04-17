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

@Entity('buses')
export class BusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  plate: string;

  @Column({ length: 20 })
  number: string;

  @Column({ length: 100 })
  model: string;

  @Column({ length: 100 })
  brand: string;

  @Column()
  year: number;

  @Column({ length: 150 })
  route: string;

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
