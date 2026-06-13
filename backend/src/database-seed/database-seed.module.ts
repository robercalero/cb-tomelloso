import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeedService } from './database-seed.service';
import { News } from '../news/entities/news.entity';
import { Team } from '../teams/entities/team.entity';
import { Player } from '../players/entities/player.entity';
import { Match } from '../matches/entities/match.entity';
import { Sponsor } from '../sponsors/entities/sponsor.entity';
import { Gallery } from '../gallery/entities/gallery.entity';
import { Activity } from '../activities/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([News, Team, Player, Match, Sponsor, Gallery, Activity]),
  ],
  providers: [DatabaseSeedService],
})
export class DatabaseSeedModule {}
