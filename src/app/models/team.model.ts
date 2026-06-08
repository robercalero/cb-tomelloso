import { Player } from './player.model';

export type TeamCategory =
  | 'Senior Autonómica'
  | 'Senior Zonal'
  | 'Júnior'
  | 'Cadete'
  | 'Infantil'
  | 'Alevín'
  | 'Benjamín'
  | 'Minibasket';

export interface Team {
  id: number;
  name: string;
  category: TeamCategory;
  season: string;
  coach?: string;
  assistantCoach?: string;
  photoUrl?: string;
  isActive: boolean;
  players: Player[];
}
