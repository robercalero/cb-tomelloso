import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'team_id', type: 'int' })
  teamId: number;

  @Column({ length: 100 })
  homeTeam: string;

  @Column({ length: 100 })
  awayTeam: string;

  @Column({ name: 'home_team_logo', type: 'varchar', length: 500, nullable: true })
  homeTeamLogo: string | null;

  @Column({ name: 'away_team_logo', type: 'varchar', length: 500, nullable: true })
  awayTeamLogo: string | null;

  @Column({ name: 'match_date', type: 'date' })
  matchDate: string;

  @Column({ name: 'match_time', type: 'time' })
  matchTime: string;

  @Column({ length: 100 })
  competition: string;

  @Column({ length: 200 })
  venue: string;

  @Column({ name: 'is_home', default: true })
  isHome: boolean;

  @Column({ name: 'score_home', type: 'smallint', nullable: true })
  scoreHome: number | null;

  @Column({ name: 'score_away', type: 'smallint', nullable: true })
  scoreAway: number | null;

  @Column({ type: 'enum', enum: ['scheduled', 'live', 'finished', 'postponed', 'cancelled'], default: 'scheduled' })
  status: MatchStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => Team, (team) => team.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
