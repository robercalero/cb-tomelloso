import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type MemberType = 'adulto' | 'juvenil' | 'familia' | 'honorario';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true })
  userId: number | null;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'member_type', type: 'enum', enum: ['adulto', 'juvenil', 'familia', 'honorario'], default: 'adulto' })
  memberType: MemberType;

  @Column({ name: 'member_number', type: 'varchar', length: 20, unique: true, nullable: true })
  memberNumber: string | null;

  @Column({ name: 'joined_at', type: 'date' })
  joinedAt: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.members, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
