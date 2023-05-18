import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MemberDocument = HydratedDocument<Member>;

@Schema()
export class Member {
  constructor(nickname: string, username: string, groupId: number) {
    this.nickname = nickname;
    this.username = username;
    this.groupId = groupId;
  }

  @Prop()
  groupId: number;

  @Prop()
  nickname: string;

  @Prop()
  username: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
