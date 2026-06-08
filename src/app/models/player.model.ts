export type Position = 'Base' | 'Escolta' | 'Alero' | 'Ala-Pívot' | 'Pívot';

export interface Player {
  id: number;
  teamId: number;
  name: string;
  surname: string;
  dorsal?: number;
  position?: Position;
  nationality: string;
  birthYear?: number;
  heightCm?: number;
  photoUrl?: string;
  isActive: boolean;
  team?: { id: number; name: string; category: string };
}
