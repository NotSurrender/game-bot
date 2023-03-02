import { Injectable } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { DuplicateError } from 'src/errors/duplicate-error';
import { InjectModel } from 'nestjs-typegoose';
import { MemberModel } from './member.model';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel(MemberModel)
    private readonly memberModel: ModelType<MemberModel>,
  ) {}

  async findByGroupId(groupId: number) {
    return this.memberModel.find({ groupId }).exec();
  }

  async find() {
    return this.memberModel.find().exec();
  }

  async create(members: MemberModel[], groupId: number) {
    const existedMembers = await this.findByGroupId(groupId);
    const duplicateMembers = members
      .filter(({ nickname }) =>
        existedMembers.some(
          (existedMember) => nickname === existedMember.nickname,
        ),
      )
      .map(({ nickname }) => nickname);

    if (duplicateMembers.length) {
      const membersStr = duplicateMembers.join(', ');
      throw new DuplicateError(
        `Duplicate error occured during the attempt to add <b>${membersStr}</b>`,
      );
    }

    await this.memberModel.create(members);
  }

  async update(member: MemberModel) {
    return await this.memberModel.updateOne(member);
  }

  async delete(nickname: string, groupId: number) {
    await this.memberModel.deleteOne({ nickname, groupId }).exec();
  }
}
