import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), MailModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
