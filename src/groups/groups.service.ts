import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from './group.model';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,
  ) {}

  async findByGroupId(groupId: number) {
    return this.groupModel.findOne({ groupId });
  }

  async create(groupId: number) {
    return this.groupModel.create({ groupId });
  }
}
