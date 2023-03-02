import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { MemberModel } from './member.model';
import { MemberService } from './member.service';
import { MemberScene } from './member.scene';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: MemberModel,
        schemaOptions: {
          collection: 'Members',
        },
      },
    ]),
  ],
  providers: [MemberService, MemberScene],
  exports: [MemberService],
})
export class MemberModule {}
