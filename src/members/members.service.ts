import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DuplicateError } from 'src/errors/duplicate-error';
import { Member, MemberDocument } from './members.model';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name)
    private memberModel: Model<MemberDocument>,
  ) {}

  async findByGroupId(groupId: number) {
    return this.memberModel.find({ groupId }).exec();
  }

  async find() {
    return this.memberModel.find().exec();
  }

  async create(members: Member[], groupId: number) {
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

  async update(member: Member) {
    const [existedMember] = await this.memberModel.find({
      groupId: member.groupId,
      nickname: member.nickname,
    });

    if (existedMember) {
      throw new DuplicateError(
        `Duplicate error occured during the attempt to add <b>${existedMember.nickname} - ${existedMember.username}</b>`,
      );
    }

    return await this.memberModel.updateOne(member);
  }

  async delete(nickname: string, groupId: number) {
    await this.memberModel.deleteOne({ nickname, groupId }).exec();
  }
}
