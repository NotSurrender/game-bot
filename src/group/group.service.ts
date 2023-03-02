import { Injectable } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { GroupModel } from './group.model';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupModel)
    private readonly groupModel: ModelType<GroupModel>,
  ) {}

  async findByGroupId(groupId: number) {
    return this.groupModel.findOne({ groupId });
  }

  async create(groupId: number) {
    const group = new GroupModel(groupId);
    return this.groupModel.create(group);
  }
}
