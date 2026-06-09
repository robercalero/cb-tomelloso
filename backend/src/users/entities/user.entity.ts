import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { News } from '../../news/entities/news.entity';
import { Member } from '../../members/entities/member.entity';

export type UserRole = 'admin' | 'editor' | 'socio' | 'visitante';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ['admin', 'editor', 'socio', 'visitante'], default: 'visitante' })
  role: UserRole;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  refreshToken: string | null;

  @OneToMany(() => News, (news) => news.author)
  news: News[];

  @OneToMany(() => Member, (member) => member.user)
  members: Member[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
