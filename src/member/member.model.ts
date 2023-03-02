import { prop } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MemberModel extends Base {}

export class MemberModel {
  constructor(nickname?: string, username?: string, groupId?: number) {
    this.nickname = nickname;
    this.username = username;
    this.groupId = groupId;
  }

  @prop()
  groupId: number;

  @prop()
  nickname: string;

  @prop()
  username: string;
}
