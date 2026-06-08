import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type NewsCategory = 'resultado' | 'club' | 'cantera' | 'evento' | 'general';
export type NewsSource = 'instagram' | 'twitter' | 'facebook' | 'youtube' | 'web';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'author_id', type: 'int', unsigned: true, nullable: true })
  authorId: number | null;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ length: 500 })
  excerpt: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'enum', enum: ['resultado', 'club', 'cantera', 'evento', 'general'], default: 'general' })
  category: NewsCategory;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'enum', enum: ['instagram', 'twitter', 'facebook', 'youtube', 'web'], nullable: true })
  source: NewsSource | null;

  @Column({ name: 'source_url', type: 'varchar', length: 500, nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'json', nullable: true })
  media: { url: string; type: string; thumbnail?: string }[] | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  views: number;

  @ManyToOne(() => User, (user) => user.news, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
