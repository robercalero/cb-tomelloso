import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';

export type PlayerPosition = 'Base' | 'Escolta' | 'Alero' | 'Ala-Pívot' | 'Pívot';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'team_id', type: 'int' })
  teamId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  surname: string;

  @Column({ name: 'dorsal', type: 'smallint', nullable: true })
  dorsal: number | null;

  @Column({ type: 'enum', enum: ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'], nullable: true })
  position: PlayerPosition | null;

  @Column({ length: 60, default: 'España' })
  nationality: string;

  @Column({ name: 'birth_year', type: 'smallint', nullable: true })
  birthYear: number | null;

  @Column({ name: 'height_cm', type: 'smallint', nullable: true })
  heightCm: number | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Team, (team) => team.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
