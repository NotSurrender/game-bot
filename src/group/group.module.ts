import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { GroupModel } from './group.model';
import { GroupService } from './group.service';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: GroupModel,
        schemaOptions: {
          collection: 'Groups',
        },
      },
    ]),
  ],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
