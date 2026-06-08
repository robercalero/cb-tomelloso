export interface Match {
  id: number;
  teamId: number;
  homeTeam: string;
  homeTeamLogo?: string;
  awayTeam: string;
  awayTeamLogo?: string;
  matchDate: string;
  matchTime: string;
  competition: string;
  venue: string;
  isHome: boolean;
  scoreHome?: number;
  scoreAway?: number;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  notes?: string;
  team?: { id: number; name: string; category: string };
}

export interface MatchListResponse {
  data: Match[];
  total: number;
  page: number;
  limit: number;
}
