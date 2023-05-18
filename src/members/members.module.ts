import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from './members.model';
import { MembersService } from './members.service';
import { MembersScene } from './members.scene';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
  ],
  providers: [MembersService, MembersScene],
  exports: [MembersService],
})
export class MembersModule {}
