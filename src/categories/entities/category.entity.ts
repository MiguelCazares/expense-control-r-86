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
import { CategoryColor } from '../enums/category-color.enum';

@Entity('expense_categories')
@Index(['ownerId', 'slug'], { unique: true })
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 60 })
  name: string;

  @Column({ length: 60 })
  slug: string;

  @Column({
    type: 'enum',
    enum: CategoryColor,
    default: CategoryColor.DEFAULT,
  })
  color: CategoryColor;

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
