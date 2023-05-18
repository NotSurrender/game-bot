import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { GroupSchema } from './group.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Group',
        schema: GroupSchema,
      },
    ]),
  ],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
