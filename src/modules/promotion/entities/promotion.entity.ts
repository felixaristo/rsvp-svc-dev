import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FileUrlTransformer } from '../../../common/transformers/file-url.transformer';
import { Branch } from '../../branch/entities/branch.entity';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ transformer: new FileUrlTransformer() })
  photo: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp', name: 'from_date' })
  fromDate: Date;

  @Column({ type: 'timestamp', name: 'to_date' })
  toDate: Date;

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
