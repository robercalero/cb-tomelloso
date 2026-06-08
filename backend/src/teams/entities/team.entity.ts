import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Player } from '../../players/entities/player.entity';
import { Match } from '../../matches/entities/match.entity';
import { Gallery } from '../../gallery/entities/gallery.entity';

export type TeamCategory = 'Senior Autonómica' | 'Senior Zonal' | 'Júnior' | 'Cadete' | 'Infantil' | 'Alevín' | 'Benjamín' | 'Minibasket';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ['Senior Autonómica', 'Senior Zonal', 'Júnior', 'Cadete', 'Infantil', 'Alevín', 'Benjamín', 'Minibasket'] })
  category: TeamCategory;

  @Column({ length: 10 })
  season: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  coach: string | null;

  @Column({ name: 'assistant_coach', type: 'varchar', length: 100, nullable: true })
  assistantCoach: string | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Player, (player) => player.team)
  players: Player[];

  @OneToMany(() => Match, (match) => match.team)
  matches: Match[];

  @OneToMany(() => Gallery, (gallery) => gallery.team)
  gallery: Gallery[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
