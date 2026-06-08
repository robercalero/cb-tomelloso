import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';

export type MediaType = 'image' | 'video';

@Entity('gallery')
export class Gallery {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'team_id', type: 'int', unsigned: true, nullable: true })
  teamId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ name: 'media_type', type: 'enum', enum: ['image', 'video'], default: 'image' })
  mediaType: MediaType;

  @Column({ length: 500 })
  url: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  season: string | null;

  @Column({ name: 'event_name', type: 'varchar', length: 100, nullable: true })
  eventName: string | null;

  @Column({ name: 'taken_at', type: 'date', nullable: true })
  takenAt: string | null;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;

  @Column({ name: 'sort_order', type: 'smallint', unsigned: true, default: 99 })
  sortOrder: number;

  @ManyToOne(() => Team, (team) => team.gallery, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
