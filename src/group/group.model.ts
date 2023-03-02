import { prop } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GroupModel extends Base {}

export class GroupModel {
  constructor(groupId: number) {
    this.groupId = groupId;
  }

  @prop()
  groupId: number;
}
