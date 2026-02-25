import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from '../../table-categories/entities/category.entity';
import { Branch } from '../../branch/entities/branch.entity';

@Entity('close_outs')
export class CloseOut {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'close_out_categories',
    joinColumn: { name: 'close_out_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @Column({ type: 'date', name: 'from_date' })
  fromDate: Date;

  @Column({ type: 'date', name: 'to_date' })
  toDate: Date;

  @Column({ name: 'from_time' })
  fromTime: string;

  @Column({ name: 'until_time' })
  untilTime: string;

  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
